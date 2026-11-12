import { Injectable } from '@nestjs/common';

import { ExamEntity } from '../../../domain/entities/exam.entity';
import { ExamRepository } from '../../../domain/repositories/exam.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaExamRepository extends ExamRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByOrderId(orderId: string): Promise<ExamEntity[]> {
    const exams = await this.prisma.exam.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
    });

    return exams.map((exam) => this.mapEntity(exam));
  }

  async findByOrderIdAndItemCode(orderId: string, itemCode: string): Promise<ExamEntity | null> {
    const exam = await this.prisma.exam.findUnique({
      where: { orderId_itemCode: { orderId, itemCode } },
    });

    return exam ? this.mapEntity(exam) : null;
  }

  async findByAccessionNumber(accessionNumber: string): Promise<ExamEntity[]> {
    const exams = await this.prisma.exam.findMany({
      where: { accessionNumber },
    });

    return exams.map((exam) => this.mapEntity(exam));
  }

  async create(exam: ExamEntity): Promise<ExamEntity> {
    const createdExam = await this.prisma.exam.create({
      data: {
        id: exam.id,
        orderId: exam.orderId,
        itemCode: exam.itemCode,
        accessionNumber: exam.accessionNumber,
        modality: exam.modality,
        procedureName: exam.procedureName,
        status: exam.status,
        createdAt: exam.createdAt,
      },
    });

    return this.mapEntity(createdExam);
  }

  async update(id: string, data: Partial<ExamEntity>): Promise<ExamEntity> {
    const updatedExam = await this.prisma.exam.update({
      where: { id },
      data: {
        itemCode: data.itemCode,
        accessionNumber: data.accessionNumber,
        modality: data.modality,
        procedureName: data.procedureName,
        status: data.status,
      },
    });

    return this.mapEntity(updatedExam);
  }

  private mapEntity(record: any): ExamEntity {
    return {
      id: record.id,
      orderId: record.orderId,
      itemCode: record.itemCode,
      accessionNumber: record.accessionNumber,
      modality: record.modality,
      procedureName: record.procedureName,
      status: record.status,
      createdAt: record.createdAt,
    };
  }
}
