import { Module } from '@nestjs/common';

import { CreateOrderUseCase } from '../../application/use-cases/create-order.use-case';
import { GetOrderUseCase } from '../../application/use-cases/get-order.use-case';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { ExamRepository } from '../../domain/repositories/exam.repository';
import { ReceivedExamRepository } from '../../domain/repositories/received-exam.repository';
import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';
import { PrismaExamRepository } from '../../infrastructure/database/repositories/prisma-exam.repository';
import { PrismaOrderRepository } from '../../infrastructure/database/repositories/prisma-order.repository';
import { PrismaReceivedExamRepository } from '../../infrastructure/database/repositories/prisma-received-exam.repository';
import { OrdersController } from '../controllers/orders.controller';

@Module({
  imports: [PrismaModule],
  controllers: [OrdersController],
  providers: [
    { provide: OrderRepository, useClass: PrismaOrderRepository },
    { provide: ExamRepository, useClass: PrismaExamRepository },
    { provide: ReceivedExamRepository, useClass: PrismaReceivedExamRepository },
    CreateOrderUseCase,
    GetOrderUseCase,
  ],
  exports: [CreateOrderUseCase, GetOrderUseCase],
})
export class OrdersModule {}
