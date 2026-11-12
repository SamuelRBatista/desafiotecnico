import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { RegisterExamArrivalDto } from '../../application/dto/register-exam-arrival.dto';
import { GetExamUseCase } from '../../application/use-cases/get-exam.use-case';
import { RegisterExamArrivalUseCase } from '../../application/use-cases/register-exam-arrival.use-case';

@ApiTags('Exames')
@Controller('exames')
export class ExamsController {
  constructor(
    private readonly registerExamArrivalUseCase: RegisterExamArrivalUseCase,
    private readonly getExamUseCase: GetExamUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary:
      'Registrar a chegada de um exame recebido pelo endpoint de integração',
  })
  @ApiBody({ type: RegisterExamArrivalDto })
  create(@Body() dto: RegisterExamArrivalDto) {
    return this.registerExamArrivalUseCase.execute({
      accessionNumber: dto.AccessionNumber,
      patientName: dto.NomePaciente,
      modality: dto.Modalidade,
      status: dto.Status,
    });
  }

  @Get(':accessionNumber')
  @ApiOperation({ summary: 'Consultar um exame pelo accession number' })
  @ApiParam({ name: 'accessionNumber', type: String })
  findByAccessionNumber(@Param('accessionNumber') accessionNumber: string) {
    return this.getExamUseCase.execute(accessionNumber);
  }
}
