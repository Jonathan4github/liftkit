import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class GenerateVariantsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  count?: number;
}
