import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateVariantDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(1)
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  rationale?: string;
}
