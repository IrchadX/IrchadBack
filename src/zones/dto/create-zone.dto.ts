import {
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  IsNotEmpty,
} from 'class-validator';

export class CreateZoneDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsString()
  name?: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsArray()
  @IsNotEmpty()
  coordinates: any;

  @IsOptional()
  @IsNumber()
  env_id?: number | null;

  @IsOptional()
  @IsNumber()
  type_id?: number | null;
}
