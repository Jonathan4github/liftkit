import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AssignDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  visitorId?: string;
}
