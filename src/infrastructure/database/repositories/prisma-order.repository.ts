import { Injectable } from '@nestjs/common';

import { OrderEntity } from '../../../domain/entities/order.entity';
import { OrderRepository } from '../../../domain/repositories/order.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaOrderRepository extends OrderRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<OrderEntity | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { exams: true, documents: true },
    });

    return order ? this.mapEntity(order) : null;
  }

  async findByOrderCode(orderCode: string): Promise<OrderEntity | null> {
    const order = await this.prisma.order.findUnique({
      where: { orderCode },
      include: { exams: true, documents: true },
    });

    return order ? this.mapEntity(order) : null;
  }

  async findByIds(ids: string[]): Promise<OrderEntity[]> {
    const orders = await this.prisma.order.findMany({
      where: { id: { in: ids } },
      include: { exams: true, documents: true },
    });

    return orders.map((order) => this.mapEntity(order));
  }

  async findAll(): Promise<OrderEntity[]> {
    const orders = await this.prisma.order.findMany({
      include: { exams: true, documents: true },
    });

    return orders.map((order) => this.mapEntity(order));
  }

  async create(order: OrderEntity): Promise<OrderEntity> {
    const createdOrder = await this.prisma.order.create({
      data: {
        id: order.id,
        orderCode: order.orderCode,
        patientName: order.patientName,
        birthDate: order.birthDate,
        gender: order.gender,
        unitCode: order.unitCode,
        integrated: order.integrated,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
      include: { exams: true, documents: true },
    });

    return this.mapEntity(createdOrder);
  }

  async update(id: string, data: Partial<OrderEntity>): Promise<OrderEntity> {
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        patientName: data.patientName,
        birthDate: data.birthDate,
        gender: data.gender,
        unitCode: data.unitCode,
        integrated: data.integrated,
        updatedAt: data.updatedAt,
      },
      include: { exams: true, documents: true },
    });

    return this.mapEntity(updatedOrder);
  }

  private mapEntity(record: any): OrderEntity {
    return {
      id: record.id,
      orderCode: record.orderCode,
      patientName: record.patientName,
      birthDate: record.birthDate,
      gender: record.gender,
      unitCode: record.unitCode,
      integrated: record.integrated,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      exams: record.exams ?? [],
      documents: record.documents ?? [],
    };
  }
}
