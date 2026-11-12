import { IsOptional, IsString } from 'class-validator';

export class LookupQueryDto {
  @IsOptional()
  @IsString()
  orderCode?: string;
}
