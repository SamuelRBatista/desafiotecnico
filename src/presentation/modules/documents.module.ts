import { Module } from '@nestjs/common';

import { CreateDocumentUseCase } from '../../application/use-cases/create-document.use-case';
import { GetDocumentsUseCase } from '../../application/use-cases/get-documents.use-case';
import { DocumentRepository } from '../../domain/repositories/document.repository';
import { ExamRepository } from '../../domain/repositories/exam.repository';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { ReceivedExamRepository } from '../../domain/repositories/received-exam.repository';
import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';
import { PrismaDocumentRepository } from '../../infrastructure/database/repositories/prisma-document.repository';
import { PrismaExamRepository } from '../../infrastructure/database/repositories/prisma-exam.repository';
import { PrismaOrderRepository } from '../../infrastructure/database/repositories/prisma-order.repository';
import { PrismaReceivedExamRepository } from '../../infrastructure/database/repositories/prisma-received-exam.repository';
import { DocumentsController } from '../controllers/documents.controller';

@Module({
  imports: [PrismaModule],
  controllers: [DocumentsController],
  providers: [
    { provide: OrderRepository, useClass: PrismaOrderRepository },
    { provide: DocumentRepository, useClass: PrismaDocumentRepository },
    { provide: ExamRepository, useClass: PrismaExamRepository },
    { provide: ReceivedExamRepository, useClass: PrismaReceivedExamRepository },
    CreateDocumentUseCase,
    GetDocumentsUseCase,
  ],
  exports: [CreateDocumentUseCase, GetDocumentsUseCase],
})
export class DocumentsModule {}
