import { Injectable } from '@nestjs/common';

import { ReceivedExamEntity } from '../../../domain/entities/received-exam.entity';
import { ReceivedExamRepository } from '../../../domain/repositories/received-exam.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaReceivedExamRepository extends ReceivedExamRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByAccessionNumber(accessionNumber: string): Promise<ReceivedExamEntity | null> {
    const receivedExam = await this.prisma.receivedExam.findUnique({
      where: { accessionNumber },
    });

    return receivedExam ? this.mapEntity(receivedExam) : null;
  }

  async create(receivedExam: ReceivedExamEntity): Promise<ReceivedExamEntity> {
    const createdReceivedExam = await this.prisma.receivedExam.create({
      data: {
        id: receivedExam.id,
        accessionNumber: receivedExam.accessionNumber,
        patientName: receivedExam.patientName,
        modality: receivedExam.modality,
        status: receivedExam.status,
        createdAt: receivedExam.createdAt,
      },
    });

    return this.mapEntity(createdReceivedExam);
  }

  async update(id: string, data: Partial<ReceivedExamEntity>): Promise<ReceivedExamEntity> {
    const updatedReceivedExam = await this.prisma.receivedExam.update({
      where: { id },
      data: {
        accessionNumber: data.accessionNumber,
        patientName: data.patientName,
        modality: data.modality,
        status: data.status,
      },
    });

    return this.mapEntity(updatedReceivedExam);
  }

  private mapEntity(record: any): ReceivedExamEntity {
    return {
      id: record.id,
      accessionNumber: record.accessionNumber,
      patientName: record.patientName,
      modality: record.modality,
      status: record.status,
      createdAt: record.createdAt,
    };
  }
}
