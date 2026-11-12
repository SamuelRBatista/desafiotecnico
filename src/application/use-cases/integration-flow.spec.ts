import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateDocumentDto } from '../dto/create-document.dto';
import { CreateOrderDto } from '../dto/create-order.dto';
import { RegisterExamArrivalDto } from '../dto/register-exam-arrival.dto';
import { DocumentEntity } from '../../domain/entities/document.entity';
import { ExamEntity } from '../../domain/entities/exam.entity';
import { OrderEntity } from '../../domain/entities/order.entity';
import { ReceivedExamEntity } from '../../domain/entities/received-exam.entity';
import { DocumentRepository } from '../../domain/repositories/document.repository';
import { ExamRepository } from '../../domain/repositories/exam.repository';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { ReceivedExamRepository } from '../../domain/repositories/received-exam.repository';
import { CreateDocumentUseCase } from './create-document.use-case';
import { CreateOrderUseCase } from './create-order.use-case';
import { RegisterExamArrivalUseCase } from './register-exam-arrival.use-case';

class MemoryOrderRepository extends OrderRepository {
  private readonly orders = new Map<string, OrderEntity>();

  async findById(id: string) {
    return [...this.orders.values()].find((order) => order.id === id) ?? null;
  }

  async findByOrderCode(orderCode: string) {
    return (
      [...this.orders.values()].find(
        (order) => order.orderCode === orderCode,
      ) ?? null
    );
  }

  async findByIds(ids: string[]) {
    return [...this.orders.values()].filter((order) => ids.includes(order.id));
  }

  async findAll() {
    return [...this.orders.values()];
  }

  async create(order: OrderEntity) {
    this.orders.set(order.id, order);
    return order;
  }

  async update(id: string, data: Partial<OrderEntity>) {
    const order = await this.findById(id);
    if (!order) {
      throw new Error(`Order ${id} not found`);
    }

    const updatedOrder = { ...order, ...data };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
}

class MemoryExamRepository extends ExamRepository {
  readonly exams: ExamEntity[] = [];

  async findByOrderId(orderId: string) {
    return this.exams.filter((exam) => exam.orderId === orderId);
  }

  async findByOrderIdAndItemCode(orderId: string, itemCode: string) {
    return (
      this.exams.find(
        (exam) => exam.orderId === orderId && exam.itemCode === itemCode,
      ) ?? null
    );
  }

  async findByAccessionNumber(accessionNumber: string) {
    return this.exams.filter(
      (exam) => exam.accessionNumber === accessionNumber,
    );
  }

  async create(exam: ExamEntity) {
    this.exams.push(exam);
    return exam;
  }

  async update(id: string, data: Partial<ExamEntity>) {
    const index = this.exams.findIndex((exam) => exam.id === id);
    if (index < 0) {
      throw new Error(`Exam ${id} not found`);
    }

    this.exams[index] = { ...this.exams[index], ...data };
    return this.exams[index];
  }
}

class MemoryDocumentRepository extends DocumentRepository {
  private readonly documents = new Map<string, DocumentEntity>();
  readonly links: Array<{ documentId: string; examIds: string[] }> = [];

  async findAll() {
    return [...this.documents.values()];
  }

  async findById(id: string) {
    return this.documents.get(id) ?? null;
  }

  async findByDocumentCodeAndOrderId(documentCode: string, orderId: string) {
    return (
      [...this.documents.values()].find(
        (document) =>
          document.documentCode === documentCode &&
          document.orderId === orderId,
      ) ?? null
    );
  }

  async findByOrderId(orderId: string) {
    return [...this.documents.values()].filter(
      (document) => document.orderId === orderId,
    );
  }

  async findPendingByOrderIds(orderIds: string[]) {
    return [...this.documents.values()].filter(
      (document) => orderIds.includes(document.orderId) && !document.integrated,
    );
  }

  async create(document: DocumentEntity) {
    this.documents.set(document.id, document);
    return document;
  }

  async update(id: string, data: Partial<DocumentEntity>) {
    const document = this.documents.get(id);
    if (!document) {
      throw new Error(`Document ${id} not found`);
    }

    const updatedDocument = { ...document, ...data };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  async linkDocumentsToExams(documentId: string, examIds: string[]) {
    this.links.push({ documentId, examIds });
  }
}

class MemoryReceivedExamRepository extends ReceivedExamRepository {
  private readonly exams = new Map<string, ReceivedExamEntity>();

  async findByAccessionNumber(accessionNumber: string) {
    return this.exams.get(accessionNumber) ?? null;
  }

  async create(exam: ReceivedExamEntity) {
    this.exams.set(exam.accessionNumber, exam);
    return exam;
  }

  async update(id: string, data: Partial<ReceivedExamEntity>) {
    const exam = [...this.exams.values()].find(
      (receivedExam) => receivedExam.id === id,
    );
    if (!exam) {
      throw new Error(`Received exam ${id} not found`);
    }

    const updatedExam = { ...exam, ...data };
    this.exams.set(updatedExam.accessionNumber, updatedExam);
    return updatedExam;
  }
}

const orderInput: CreateOrderDto = {
  CodigoPedido: '616',
  NomePaciente: 'ALEFHER MONTONI DE ALMEIDA',
  DataNascimento: '19970601',
  Sexo: 'M',
  CodUnidade: '104',
  Exames: [
    {
      CodigoItemPedido: '930',
      AccessionNumber: '930',
      Modalidade: 'CR',
      NomeProcedimento: 'RX ANTEBRACO ESQUERDO',
    },
  ],
};

const orderInputForUseCase = {
  orderCode: orderInput.CodigoPedido,
  patientName: orderInput.NomePaciente,
  birthDate: '1997-06-01',
  gender: orderInput.Sexo,
  unitCode: orderInput.CodUnidade,
  exams: orderInput.Exames?.map((exam) => ({
    itemCode: exam.CodigoItemPedido,
    accessionNumber: exam.AccessionNumber,
    modality: exam.Modalidade,
    procedureName: exam.NomeProcedimento,
    status: exam.Status,
  })),
};

describe('challenge request contracts', () => {
  it('accepts the Portuguese order payload, numeric codes, and YYYYMMDD birth date', async () => {
    const dto = plainToInstance(
      CreateOrderDto,
      {
        ...orderInput,
        CodigoPedido: 616,
        CodUnidade: 104,
        Exames: [{ ...orderInput.Exames?.[0], CodigoItemPedido: 930 }],
      },
      { enableImplicitConversion: false },
    );

    expect(await validate(dto)).toHaveLength(0);
    expect(dto.CodigoPedido).toBe('616');
    expect(dto.CodUnidade).toBe('104');
    expect(dto.DataNascimento).toBe('1997-06-01');
    expect(dto.Exames?.[0].CodigoItemPedido).toBe('930');
  });

  it('accepts the Portuguese document and exam-arrival payloads', async () => {
    const document = plainToInstance(CreateDocumentDto, {
      CodigoDocumento: 251,
      CodigoPedido: 615,
      NomeDocumento: 'PEDIDO',
      Documento: 'base64',
    });
    const exam = plainToInstance(RegisterExamArrivalDto, {
      AccessionNumber: '930',
      NomePaciente: 'ALEFHER MONTONI DE ALMEIDA',
      Modalidade: 'CR',
      Status: 'NOVO',
    });

    expect(await validate(document)).toHaveLength(0);
    expect(document.CodigoDocumento).toBe('251');
    expect(await validate(exam)).toHaveLength(0);
  });
});

describe('challenge integration rules', () => {
  let orders: MemoryOrderRepository;
  let exams: MemoryExamRepository;
  let documents: MemoryDocumentRepository;
  let receivedExams: MemoryReceivedExamRepository;
  let createOrder: CreateOrderUseCase;

  beforeEach(() => {
    orders = new MemoryOrderRepository();
    exams = new MemoryExamRepository();
    documents = new MemoryDocumentRepository();
    receivedExams = new MemoryReceivedExamRepository();
    createOrder = new CreateOrderUseCase(orders, exams, receivedExams);
  });

  it('saves a new order as pending when no matching exam has arrived', async () => {
    const order = await createOrder.execute(orderInputForUseCase);

    expect(order.integrated).toBe(false);
    expect(exams.exams).toHaveLength(1);
    expect(exams.exams[0].status).toBe('NOVO');
  });

  it('integrates an order when its accession number already arrived', async () => {
    await receivedExams.create({
      id: 'received-930',
      accessionNumber: '930',
      patientName: orderInput.NomePaciente,
      modality: 'CR',
      status: 'NOVO',
      createdAt: new Date(),
    });

    const order = await createOrder.execute(orderInputForUseCase);

    expect(order.integrated).toBe(true);
  });

  it('adds only new exams when the same order is received again', async () => {
    const firstOrder = await createOrder.execute(orderInputForUseCase);
    const updatedOrder = await createOrder.execute({
      ...orderInputForUseCase,
      exams: [
        ...(orderInputForUseCase.exams ?? []),
        {
          itemCode: '931',
          accessionNumber: '931',
          modality: 'CR',
          procedureName: 'RX TORAX',
        },
      ],
    });

    expect(updatedOrder.id).toBe(firstOrder.id);
    expect(exams.exams.map((exam) => exam.itemCode)).toEqual(['930', '931']);
  });

  it('keeps documents pending until arrival and links only the matching exam', async () => {
    const order = await createOrder.execute({
      ...orderInputForUseCase,
      exams: [
        ...(orderInputForUseCase.exams ?? []),
        {
          itemCode: '931',
          accessionNumber: '931',
          modality: 'CR',
          procedureName: 'RX TORAX',
        },
      ],
    });
    const createDocument = new CreateDocumentUseCase(
      orders,
      documents,
      exams,
      receivedExams,
    );
    const document = await createDocument.execute({
      documentCode: '251',
      orderCode: order.orderCode,
      documentName: 'PEDIDO',
      content: 'base64',
    });

    expect(document.integrated).toBe(false);
    expect(documents.links).toHaveLength(0);

    const arrival = new RegisterExamArrivalUseCase(
      orders,
      exams,
      documents,
      receivedExams,
    );
    await arrival.execute({
      accessionNumber: '930',
      patientName: orderInput.NomePaciente,
      modality: 'CR',
      status: 'NOVO',
    });

    expect(documents.links).toEqual([
      { documentId: document.id, examIds: [exams.exams[0].id] },
    ]);
    expect((await documents.findById(document.id))?.integrated).toBe(true);
    expect((await orders.findById(order.id))?.integrated).toBe(true);
  });

  it('rejects duplicate documents for the same order', async () => {
    const order = await createOrder.execute(orderInputForUseCase);
    const createDocument = new CreateDocumentUseCase(
      orders,
      documents,
      exams,
      receivedExams,
    );
    const input = {
      documentCode: '251',
      orderCode: order.orderCode,
      documentName: 'PEDIDO',
      content: 'base64',
    };

    await createDocument.execute(input);
    await expect(createDocument.execute(input)).rejects.toThrow(
      'já foi cadastrado',
    );
  });
});
