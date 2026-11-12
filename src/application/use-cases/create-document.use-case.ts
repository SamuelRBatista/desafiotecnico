import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';

import { CreateDocumentInput } from '../dto/create-document.dto';
import { DocumentEntity } from '../../domain/entities/document.entity';
import { DocumentRepository } from '../../domain/repositories/document.repository';
import { ExamRepository } from '../../domain/repositories/exam.repository';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { ReceivedExamRepository } from '../../domain/repositories/received-exam.repository';

@Injectable()
export class CreateDocumentUseCase {
  private readonly logger = new Logger(CreateDocumentUseCase.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly documentRepository: DocumentRepository,
    private readonly examRepository: ExamRepository,
    private readonly receivedExamRepository: ReceivedExamRepository,
  ) {}

  async execute(input: CreateDocumentInput): Promise<DocumentEntity> {
    const order = await this.orderRepository.findByOrderCode(input.orderCode);
    if (!order) {
      throw new NotFoundException(`Pedido ${input.orderCode} não encontrado.`);
    }

    const existingDocument =
      await this.documentRepository.findByDocumentCodeAndOrderId(
        input.documentCode,
        order.id,
      );

    if (existingDocument) {
      throw new ConflictException(
        `Documento ${input.documentCode} já foi cadastrado para o pedido ${input.orderCode}.`,
      );
    }

    const now = new Date();
    const document = await this.documentRepository.create({
      id: randomUUID(),
      orderId: order.id,
      documentCode: input.documentCode,
      documentName: input.documentName,
      content: input.content,
      integrated: false,
      createdAt: now,
    });

    const orderExams = await this.examRepository.findByOrderId(order.id);
    const arrivedExamIds: string[] = [];
    for (const exam of orderExams) {
      const receivedExam =
        await this.receivedExamRepository.findByAccessionNumber(
          exam.accessionNumber,
        );
      if (receivedExam) {
        arrivedExamIds.push(exam.id);
      }
    }

    if (arrivedExamIds.length > 0) {
      await this.documentRepository.linkDocumentsToExams(
        document.id,
        arrivedExamIds,
      );

      const updatedDocument = await this.documentRepository.update(
        document.id,
        {
          integrated: true,
        },
      );

      this.logger.log(
        `Documento ${input.documentCode} vinculado aos exames do pedido ${input.orderCode}.`,
      );
      return updatedDocument;
    }

    return document;
  }
}
