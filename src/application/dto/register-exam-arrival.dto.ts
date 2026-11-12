import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RegisterExamArrivalDto {
  @ApiProperty({ example: '930' })
  @IsString()
  AccessionNumber: string;

  @ApiProperty({ example: 'ALEFHER MONTONI DE ALMEIDA' })
  @IsString()
  NomePaciente: string;

  @ApiProperty({ example: 'CR' })
  @IsString()
  Modalidade: string;

  @ApiProperty({ example: 'NOVO' })
  @IsString()
  Status: string;
}

export interface RegisterExamArrivalInput {
  accessionNumber: string;
  patientName: string;
  modality: string;
  status: string;
}
