import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { RegisterExamArrivalInput } from '../dto/register-exam-arrival.dto';
import { ReceivedExamEntity } from '../../domain/entities/received-exam.entity';
import { DocumentRepository } from '../../domain/repositories/document.repository';
import { ExamRepository } from '../../domain/repositories/exam.repository';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { ReceivedExamRepository } from '../../domain/repositories/received-exam.repository';

@Injectable()
export class RegisterExamArrivalUseCase {
  private readonly logger = new Logger(RegisterExamArrivalUseCase.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly examRepository: ExamRepository,
    private readonly documentRepository: DocumentRepository,
    private readonly receivedExamRepository: ReceivedExamRepository,
  ) {}

  async execute(input: RegisterExamArrivalInput): Promise<ReceivedExamEntity> {
    const now = new Date();
    const existingReceivedExam =
      await this.receivedExamRepository.findByAccessionNumber(
        input.accessionNumber,
      );

    const receivedExam =
      existingReceivedExam ??
      (await this.receivedExamRepository.create({
        id: randomUUID(),
        accessionNumber: input.accessionNumber,
        patientName: input.patientName,
        modality: input.modality,
        status: input.status,
        createdAt: now,
      }));

    const matchingExams = await this.examRepository.findByAccessionNumber(
      input.accessionNumber,
    );
    const matchingOrderIds = [
      ...new Set(matchingExams.map((exam) => exam.orderId)),
    ];

    if (matchingOrderIds.length > 0) {
      for (const orderId of matchingOrderIds) {
        await this.orderRepository.update(orderId, {
          integrated: true,
          updatedAt: now,
        });

        const pendingDocuments =
          await this.documentRepository.findPendingByOrderIds([orderId]);
        if (pendingDocuments.length > 0) {
          const examIds = matchingExams
            .filter((exam) => exam.orderId === orderId)
            .map((exam) => exam.id);
          for (const document of pendingDocuments) {
            if (examIds.length > 0) {
              await this.documentRepository.linkDocumentsToExams(
                document.id,
                examIds,
              );
              await this.documentRepository.update(document.id, {
                integrated: true,
              });
            }
          }
        }
      }
    }

    this.logger.log(
      `Exame ${input.accessionNumber} registrado para processamento de integração.`,
    );
    return receivedExam;
  }
}
