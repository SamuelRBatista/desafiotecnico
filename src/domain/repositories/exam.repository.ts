import { ExamEntity } from '../entities/exam.entity';

export abstract class ExamRepository {
  abstract findByOrderId(orderId: string): Promise<ExamEntity[]>;
  abstract findByOrderIdAndItemCode(orderId: string, itemCode: string): Promise<ExamEntity | null>;
  abstract findByAccessionNumber(accessionNumber: string): Promise<ExamEntity[]>;
  abstract create(exam: ExamEntity): Promise<ExamEntity>;
  abstract update(id: string, data: Partial<ExamEntity>): Promise<ExamEntity>;
}
