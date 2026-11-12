import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { CreateOrderInput } from '../dto/create-order.dto';
import { OrderEntity } from '../../domain/entities/order.entity';
import { ExamRepository } from '../../domain/repositories/exam.repository';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { ReceivedExamRepository } from '../../domain/repositories/received-exam.repository';

@Injectable()
export class CreateOrderUseCase {
  private readonly logger = new Logger(CreateOrderUseCase.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly examRepository: ExamRepository,
    private readonly receivedExamRepository: ReceivedExamRepository,
  ) {}

  async execute(input: CreateOrderInput): Promise<OrderEntity> {
    const now = new Date();
    const existingOrder = await this.orderRepository.findByOrderCode(
      input.orderCode,
    );

    const order =
      existingOrder ??
      (await this.orderRepository.create({
        id: randomUUID(),
        orderCode: input.orderCode,
        patientName: input.patientName,
        birthDate: new Date(input.birthDate),
        gender: input.gender,
        unitCode: input.unitCode,
        integrated: false,
        createdAt: now,
        updatedAt: now,
      }));

    if (existingOrder) {
      const updatedOrder = await this.orderRepository.update(order.id, {
        patientName: input.patientName,
        birthDate: new Date(input.birthDate),
        gender: input.gender,
        unitCode: input.unitCode,
        updatedAt: now,
      });
      this.logger.log(
        `Pedido ${input.orderCode} atualizado com dados complementares.`,
      );
      Object.assign(order, updatedOrder);
    }

    if (input.exams?.length) {
      for (const examDto of input.exams) {
        const existingExam = await this.examRepository.findByOrderIdAndItemCode(
          order.id,
          examDto.itemCode,
        );
        if (!existingExam) {
          await this.examRepository.create({
            id: randomUUID(),
            orderId: order.id,
            itemCode: examDto.itemCode,
            accessionNumber: examDto.accessionNumber,
            modality: examDto.modality,
            procedureName: examDto.procedureName,
            status: examDto.status ?? 'NOVO',
            createdAt: now,
          });
        }
      }
    }

    const orderExams = await this.examRepository.findByOrderId(order.id);
    const integrated = await this.isOrderIntegrated(orderExams);

    const persistedOrder = await this.orderRepository.update(order.id, {
      integrated,
      updatedAt: new Date(),
    });

    return persistedOrder;
  }

  private async isOrderIntegrated(
    exams: Array<{ accessionNumber: string }>,
  ): Promise<boolean> {
    for (const exam of exams) {
      const receivedExam =
        await this.receivedExamRepository.findByAccessionNumber(
          exam.accessionNumber,
        );
      if (receivedExam) {
        return true;
      }
    }

    return false;
  }
}
