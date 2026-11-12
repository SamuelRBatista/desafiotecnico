import { Injectable, NotFoundException } from '@nestjs/common';

import { OrderEntity } from '../../domain/entities/order.entity';
import { OrderRepository } from '../../domain/repositories/order.repository';

@Injectable()
export class GetOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(orderCode?: string): Promise<OrderEntity[]> {
    if (orderCode) {
      const order = await this.orderRepository.findByOrderCode(orderCode);
      if (!order) {
        throw new NotFoundException(`Pedido ${orderCode} não encontrado.`);
      }

      return [order];
    }

    return this.orderRepository.findAll();
  }

  async findByCode(orderCode: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findByOrderCode(orderCode);
    if (!order) {
      throw new NotFoundException(`Pedido ${orderCode} não encontrado.`);
    }

    return order;
  }
}
