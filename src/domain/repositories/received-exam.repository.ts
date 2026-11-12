import { ReceivedExamEntity } from '../entities/received-exam.entity';

export abstract class ReceivedExamRepository {
  abstract findByAccessionNumber(accessionNumber: string): Promise<ReceivedExamEntity | null>;
  abstract create(receivedExam: ReceivedExamEntity): Promise<ReceivedExamEntity>;
  abstract update(id: string, data: Partial<ReceivedExamEntity>): Promise<ReceivedExamEntity>;
}
