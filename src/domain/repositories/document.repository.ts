import { DocumentEntity } from '../entities/document.entity';

export abstract class DocumentRepository {
  abstract findAll(): Promise<DocumentEntity[]>;
  abstract findById(id: string): Promise<DocumentEntity | null>;
  abstract findByDocumentCodeAndOrderId(documentCode: string, orderId: string): Promise<DocumentEntity | null>;
  abstract findByOrderId(orderId: string): Promise<DocumentEntity[]>;
  abstract findPendingByOrderIds(orderIds: string[]): Promise<DocumentEntity[]>;
  abstract create(document: DocumentEntity): Promise<DocumentEntity>;
  abstract update(id: string, data: Partial<DocumentEntity>): Promise<DocumentEntity>;
  abstract linkDocumentsToExams(documentId: string, examIds: string[]): Promise<void>;
}
