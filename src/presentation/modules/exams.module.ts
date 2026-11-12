import { Module } from '@nestjs/common';

import { RegisterExamArrivalUseCase } from '../../application/use-cases/register-exam-arrival.use-case';
import { GetExamUseCase } from '../../application/use-cases/get-exam.use-case';
import { DocumentRepository } from '../../domain/repositories/document.repository';
import { ExamRepository } from '../../domain/repositories/exam.repository';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { ReceivedExamRepository } from '../../domain/repositories/received-exam.repository';
import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';
import { PrismaDocumentRepository } from '../../infrastructure/database/repositories/prisma-document.repository';
import { PrismaExamRepository } from '../../infrastructure/database/repositories/prisma-exam.repository';
import { PrismaOrderRepository } from '../../infrastructure/database/repositories/prisma-order.repository';
import { PrismaReceivedExamRepository } from '../../infrastructure/database/repositories/prisma-received-exam.repository';
import { ExamsController } from '../controllers/exams.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ExamsController],
  providers: [
    { provide: OrderRepository, useClass: PrismaOrderRepository },
    { provide: ExamRepository, useClass: PrismaExamRepository },
    { provide: DocumentRepository, useClass: PrismaDocumentRepository },
    { provide: ReceivedExamRepository, useClass: PrismaReceivedExamRepository },
    RegisterExamArrivalUseCase,
    GetExamUseCase,
  ],
  exports: [RegisterExamArrivalUseCase, GetExamUseCase],
})
export class ExamsModule {}
