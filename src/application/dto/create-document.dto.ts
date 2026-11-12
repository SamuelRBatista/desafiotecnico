import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

const normalizeCode = ({ value }: { value: unknown }): unknown =>
  typeof value === 'number' ? String(value) : value;

export class CreateDocumentDto {
  @ApiProperty({ example: 251 })
  @Transform(normalizeCode)
  @IsString()
  CodigoDocumento: string;

  @ApiProperty({ example: 615 })
  @Transform(normalizeCode)
  @IsString()
  CodigoPedido: string;

  @ApiProperty({ example: 'PEDIDO' })
  @IsString()
  NomeDocumento: string;

  @ApiProperty({ example: 'base64' })
  @IsString()
  Documento: string;
}

export interface CreateDocumentInput {
  documentCode: string;
  orderCode: string;
  documentName: string;
  content: string;
}
