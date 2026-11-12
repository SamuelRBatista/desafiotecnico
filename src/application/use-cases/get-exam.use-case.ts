import { Injectable, NotFoundException } from '@nestjs/common';

import { ExamRepository } from '../../domain/repositories/exam.repository';
import { ReceivedExamRepository } from '../../domain/repositories/received-exam.repository';

@Injectable()
export class GetExamUseCase {
  constructor(
    private readonly receivedExamRepository: ReceivedExamRepository,
    private readonly examRepository: ExamRepository,
  ) {}

  async execute(accessionNumber: string) {
    const receivedExam =
      await this.receivedExamRepository.findByAccessionNumber(accessionNumber);
    if (receivedExam) {
      return receivedExam;
    }

    const [orderExam] =
      await this.examRepository.findByAccessionNumber(accessionNumber);
    if (orderExam) {
      return orderExam;
    }

    throw new NotFoundException(`Exame ${accessionNumber} não encontrado.`);
  }
}
