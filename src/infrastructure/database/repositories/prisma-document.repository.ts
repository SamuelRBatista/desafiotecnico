import { Injectable } from '@nestjs/common';

import { DocumentEntity } from '../../../domain/entities/document.entity';
import { DocumentRepository } from '../../../domain/repositories/document.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaDocumentRepository extends DocumentRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(): Promise<DocumentEntity[]> {
    const documents = await this.prisma.document.findMany({
      include: { exams: { include: { exam: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return documents.map((document) => this.mapEntity(document));
  }

  async findById(id: string): Promise<DocumentEntity | null> {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: { exams: { include: { exam: true } } },
    });

    return document ? this.mapEntity(document) : null;
  }

  async findByDocumentCodeAndOrderId(documentCode: string, orderId: string): Promise<DocumentEntity | null> {
    const document = await this.prisma.document.findUnique({
      where: { documentCode_orderId: { documentCode, orderId } },
      include: { exams: { include: { exam: true } } },
    });

    return document ? this.mapEntity(document) : null;
  }

  async findByOrderId(orderId: string): Promise<DocumentEntity[]> {
    const documents = await this.prisma.document.findMany({
      where: { orderId },
      include: { exams: { include: { exam: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return documents.map((document) => this.mapEntity(document));
  }

  async findPendingByOrderIds(orderIds: string[]): Promise<DocumentEntity[]> {
    const documents = await this.prisma.document.findMany({
      where: { orderId: { in: orderIds }, integrated: false },
      include: { exams: { include: { exam: true } } },
    });

    return documents.map((document) => this.mapEntity(document));
  }

  async create(document: DocumentEntity): Promise<DocumentEntity> {
    const createdDocument = await this.prisma.document.create({
      data: {
        id: document.id,
        documentCode: document.documentCode,
        orderId: document.orderId,
        documentName: document.documentName,
        content: document.content,
        integrated: document.integrated,
        createdAt: document.createdAt,
      },
      include: { exams: { include: { exam: true } } },
    });

    return this.mapEntity(createdDocument);
  }

  async update(id: string, data: Partial<DocumentEntity>): Promise<DocumentEntity> {
    const updatedDocument = await this.prisma.document.update({
      where: { id },
      data: {
        documentCode: data.documentCode,
        orderId: data.orderId,
        documentName: data.documentName,
        content: data.content,
        integrated: data.integrated,
      },
      include: { exams: { include: { exam: true } } },
    });

    return this.mapEntity(updatedDocument);
  }

  async linkDocumentsToExams(documentId: string, examIds: string[]): Promise<void> {
    for (const examId of examIds) {
      await this.prisma.documentExamLink.upsert({
        where: { documentId_examId: { documentId, examId } },
        update: {},
        create: { documentId, examId },
      });
    }
  }

  private mapEntity(record: any): DocumentEntity {
    return {
      id: record.id,
      documentCode: record.documentCode,
      orderId: record.orderId,
      documentName: record.documentName,
      content: record.content,
      integrated: record.integrated,
      createdAt: record.createdAt,
      exams: (record.exams ?? []).map((link: any) => link.exam),
    };
  }
}
