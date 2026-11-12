import { OrderEntity } from '../entities/order.entity';

export abstract class OrderRepository {
  abstract findById(id: string): Promise<OrderEntity | null>;
  abstract findByOrderCode(orderCode: string): Promise<OrderEntity | null>;
  abstract findByIds(ids: string[]): Promise<OrderEntity[]>;
  abstract findAll(): Promise<OrderEntity[]>;
  abstract create(order: OrderEntity): Promise<OrderEntity>;
  abstract update(id: string, data: Partial<OrderEntity>): Promise<OrderEntity>;
}
