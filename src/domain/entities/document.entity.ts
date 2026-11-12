import type { ExamEntity } from './exam.entity';

export class DocumentEntity {
  id: string;
  documentCode: string;
  orderId: string;
  documentName: string;
  content: string;
  integrated: boolean;
  createdAt: Date;
  exams?: ExamEntity[];
}
