import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { CreateDocumentDto } from '../../application/dto/create-document.dto';
import { LookupQueryDto } from '../../application/dto/lookup-query.dto';
import { CreateDocumentUseCase } from '../../application/use-cases/create-document.use-case';
import { GetDocumentsUseCase } from '../../application/use-cases/get-documents.use-case';

@ApiTags('Documentos')
@Controller('documentos')
export class DocumentsController {
  constructor(
    private readonly createDocumentUseCase: CreateDocumentUseCase,
    private readonly getDocumentsUseCase: GetDocumentsUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Receber e persistir um documento médico' })
  @ApiBody({ type: CreateDocumentDto })
  create(@Body() dto: CreateDocumentDto) {
    return this.createDocumentUseCase.execute({
      documentCode: dto.CodigoDocumento,
      orderCode: dto.CodigoPedido,
      documentName: dto.NomeDocumento,
      content: dto.Documento,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Consultar documentos vinculados ao pedido' })
  @ApiQuery({ name: 'orderCode', required: false, type: String })
  findAll(@Query() query: LookupQueryDto) {
    return this.getDocumentsUseCase.execute(query.orderCode);
  }

  @Get(':codigoPedido')
  @ApiOperation({ summary: 'Consultar documentos pelo código do pedido' })
  @ApiParam({ name: 'codigoPedido', type: String })
  findByOrderCode(@Param('codigoPedido') codigoPedido: string) {
    return this.getDocumentsUseCase.execute(codigoPedido);
  }
}
