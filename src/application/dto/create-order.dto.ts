import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

const normalizeCode = ({ value }: { value: unknown }): unknown =>
  typeof value === 'number' ? String(value) : value;

export class CreateOrderExamDto {
  @ApiProperty({ example: 930 })
  @Transform(normalizeCode)
  @IsString()
  CodigoItemPedido: string;

  @ApiProperty({ example: '930' })
  @IsString()
  AccessionNumber: string;

  @ApiProperty({ example: 'CR' })
  @IsString()
  Modalidade: string;

  @ApiProperty({ example: 'RX ANTEBRACO ESQUERDO' })
  @IsString()
  NomeProcedimento: string;

  @ApiPropertyOptional({ example: 'NOVO' })
  @IsOptional()
  @IsString()
  Status?: string;
}

export class CreateOrderDto {
  @ApiProperty({ example: 616 })
  @Transform(normalizeCode)
  @IsString()
  CodigoPedido: string;

  @ApiProperty({ example: 'ALEFHER MONTONI DE ALMEIDA' })
  @IsString()
  NomePaciente: string;

  @ApiProperty({
    example: '19970601',
    description: 'Data no formato AAAAMMDD.',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && /^\d{8}$/.test(value)
      ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`
      : value,
  )
  @IsDateString({ strict: true, strictSeparator: true })
  DataNascimento: string;

  @ApiProperty({ example: 'M' })
  @IsString()
  Sexo: string;

  @ApiProperty({ example: 104 })
  @Transform(normalizeCode)
  @IsString()
  CodUnidade: string;

  @ApiPropertyOptional({ type: [CreateOrderExamDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderExamDto)
  Exames?: CreateOrderExamDto[];
}

export interface CreateOrderInput {
  orderCode: string;
  patientName: string;
  birthDate: string;
  gender: string;
  unitCode: string;
  exams?: Array<{
    itemCode: string;
    accessionNumber: string;
    modality: string;
    procedureName: string;
    status?: string;
  }>;
}
