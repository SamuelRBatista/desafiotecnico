import type { DocumentEntity } from './document.entity';
import type { ExamEntity } from './exam.entity';

export class OrderEntity {
  id: string;
  orderCode: string;
  patientName: string;
  birthDate: Date;
  gender: string;
  unitCode: string;
  integrated: boolean;
  createdAt: Date;
  updatedAt: Date;
  exams?: ExamEntity[];
  documents?: DocumentEntity[];
}
