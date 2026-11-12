import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { CreateOrderDto } from '../../application/dto/create-order.dto';
import { LookupQueryDto } from '../../application/dto/lookup-query.dto';
import { CreateOrderUseCase } from '../../application/use-cases/create-order.use-case';
import { GetOrderUseCase } from '../../application/use-cases/get-order.use-case';

@ApiTags('Pedidos')
@Controller('pedidos')
export class OrdersController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Receber ou atualizar um pedido clínico' })
  @ApiBody({ type: CreateOrderDto })
  create(@Body() dto: CreateOrderDto) {
    return this.createOrderUseCase.execute({
      orderCode: dto.CodigoPedido,
      patientName: dto.NomePaciente,
      birthDate: dto.DataNascimento,
      gender: dto.Sexo,
      unitCode: dto.CodUnidade,
      exams: dto.Exames?.map((exam) => ({
        itemCode: exam.CodigoItemPedido,
        accessionNumber: exam.AccessionNumber,
        modality: exam.Modalidade,
        procedureName: exam.NomeProcedimento,
        status: exam.Status,
      })),
    });
  }

  @Get()
  @ApiOperation({ summary: 'Consultar pedidos por código ou listar todos' })
  @ApiQuery({ name: 'orderCode', required: false, type: String })
  findAll(@Query() query: LookupQueryDto) {
    return this.getOrderUseCase.execute(query.orderCode);
  }

  @Get(':codigoPedido')
  @ApiOperation({ summary: 'Consultar um pedido pelo código' })
  @ApiParam({ name: 'codigoPedido', type: String })
  findByCode(@Param('codigoPedido') codigoPedido: string) {
    return this.getOrderUseCase.findByCode(codigoPedido);
  }
}
