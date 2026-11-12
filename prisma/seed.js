const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const now = new Date();

const arrivals = [
  {
    accessionNumber: 'DEMO-930',
    patientName: 'Paciente Demonstração 1',
    modality: 'CR',
    status: 'NOVO',
  },
  {
    accessionNumber: 'DEMO-950',
    patientName: 'Paciente Demonstração 3',
    modality: 'CT',
    status: 'NOVO',
  },
];

const orders = [
  {
    orderCode: 'DEMO-616',
    patientName: 'Paciente Demonstração 1',
    birthDate: new Date('1997-06-01T00:00:00.000Z'),
    gender: 'M',
    unitCode: '104',
    exams: [
      {
        itemCode: 'DEMO-ITEM-930',
        accessionNumber: 'DEMO-930',
        modality: 'CR',
        procedureName: 'RX ANTEBRAÇO ESQUERDO',
        status: 'NOVO',
      },
      {
        itemCode: 'DEMO-ITEM-931',
        accessionNumber: 'DEMO-931',
        modality: 'CT',
        procedureName: 'TOMOGRAFIA DE CRÂNIO',
        status: 'NOVO',
      },
    ],
  },
  {
    orderCode: 'DEMO-617',
    patientName: 'Paciente Demonstração 2',
    birthDate: new Date('1985-03-20T00:00:00.000Z'),
    gender: 'F',
    unitCode: '105',
    exams: [
      {
        itemCode: 'DEMO-ITEM-940',
        accessionNumber: 'DEMO-940',
        modality: 'MR',
        procedureName: 'RESSONÂNCIA DE JOELHO',
        status: 'NOVO',
      },
    ],
  },
  {
    orderCode: 'DEMO-618',
    patientName: 'Paciente Demonstração 3',
    birthDate: new Date('1990-11-12T00:00:00.000Z'),
    gender: 'F',
    unitCode: '106',
    exams: [
      {
        itemCode: 'DEMO-ITEM-950',
        accessionNumber: 'DEMO-950',
        modality: 'CT',
        procedureName: 'TOMOGRAFIA DE TÓRAX',
        status: 'NOVO',
      },
    ],
  },
];

async function upsertReceivedExam(arrival) {
  return prisma.receivedExam.upsert({
    where: { accessionNumber: arrival.accessionNumber },
    update: {
      patientName: arrival.patientName,
      modality: arrival.modality,
      status: arrival.status,
    },
    create: arrival,
  });
}

async function upsertOrder(orderData) {
  const { exams, ...data } = orderData;
  const order = await prisma.order.upsert({
    where: { orderCode: data.orderCode },
    update: { ...data, updatedAt: now },
    create: { ...data, createdAt: now, updatedAt: now },
  });

  for (const exam of exams) {
    await prisma.exam.upsert({
      where: {
        orderId_itemCode: {
          orderId: order.id,
          itemCode: exam.itemCode,
        },
      },
      update: exam,
      create: { ...exam, orderId: order.id, createdAt: now },
    });
  }

  const orderExams = await prisma.exam.findMany({
    where: { orderId: order.id },
  });
  const receivedExams = await prisma.receivedExam.findMany({
    where: {
      accessionNumber: { in: orderExams.map((exam) => exam.accessionNumber) },
    },
  });

  return prisma.order.update({
    where: { id: order.id },
    data: { integrated: receivedExams.length > 0 },
  });
}

async function upsertDocument({ orderCode, documentCode, documentName }) {
  const order = await prisma.order.findUniqueOrThrow({ where: { orderCode } });
  const document = await prisma.document.upsert({
    where: {
      documentCode_orderId: {
        documentCode,
        orderId: order.id,
      },
    },
    update: {
      documentName,
      content: 'U2VlZCBkZSBkZW1vbnN0cmHDp8Ojby4=',
    },
    create: {
      documentCode,
      orderId: order.id,
      documentName,
      content: 'U2VlZCBkZSBkZW1vbnN0cmHDp8Ojby4=',
      integrated: false,
      createdAt: now,
    },
  });

  const orderExams = await prisma.exam.findMany({
    where: { orderId: order.id },
  });
  const receivedExams = await prisma.receivedExam.findMany({
    where: {
      accessionNumber: { in: orderExams.map((exam) => exam.accessionNumber) },
    },
  });
  const receivedAccessions = new Set(
    receivedExams.map((exam) => exam.accessionNumber),
  );
  const arrivedExamIds = orderExams
    .filter((exam) => receivedAccessions.has(exam.accessionNumber))
    .map((exam) => exam.id);

  for (const examId of arrivedExamIds) {
    await prisma.documentExamLink.upsert({
      where: {
        documentId_examId: { documentId: document.id, examId },
      },
      update: {},
      create: { documentId: document.id, examId },
    });
  }

  return prisma.document.update({
    where: { id: document.id },
    data: { integrated: arrivedExamIds.length > 0 },
  });
}

async function main() {
  for (const arrival of arrivals.slice(0, 1)) {
    await upsertReceivedExam(arrival);
  }

  for (const order of orders.slice(0, 2)) {
    await upsertOrder(order);
  }

  await upsertDocument({
    orderCode: 'DEMO-616',
    documentCode: 'DEMO-DOC-251',
    documentName: 'Pedido médico integrado',
  });
  await upsertDocument({
    orderCode: 'DEMO-617',
    documentCode: 'DEMO-DOC-252',
    documentName: 'Documento pendente',
  });

  await upsertOrder(orders[2]);
  await upsertDocument({
    orderCode: 'DEMO-618',
    documentCode: 'DEMO-DOC-253',
    documentName: 'Documento vinculado após a chegada',
  });

  await upsertReceivedExam(arrivals[1]);
  await upsertOrder(orders[2]);
  await upsertDocument({
    orderCode: 'DEMO-618',
    documentCode: 'DEMO-DOC-253',
    documentName: 'Documento vinculado após a chegada',
  });

  console.log(
    'Seed concluído: 3 pedidos, exames, documentos e chegadas de demonstração.',
  );
}

main()
  .catch((error) => {
    console.error('Falha ao carregar os dados de demonstração:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
