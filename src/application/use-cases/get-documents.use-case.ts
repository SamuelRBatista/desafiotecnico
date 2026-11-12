import { Injectable, NotFoundException } from '@nestjs/common';

import { DocumentEntity } from '../../domain/entities/document.entity';
import { DocumentRepository } from '../../domain/repositories/document.repository';
import { OrderRepository } from '../../domain/repositories/order.repository';

@Injectable()
export class GetDocumentsUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly documentRepository: DocumentRepository,
  ) {}

  async execute(orderCode?: string): Promise<DocumentEntity[]> {
    if (!orderCode) {
      return this.documentRepository.findAll();
    }

    const order = await this.orderRepository.findByOrderCode(orderCode);
    if (!order) {
      throw new NotFoundException(`Pedido ${orderCode} não encontrado.`);
    }

    return this.documentRepository.findByOrderId(order.id);
  }
}
