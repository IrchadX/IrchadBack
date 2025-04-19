import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';

export class CreatePoiDto {
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
  coordinates: any;

  @IsOptional()
  @IsString()
  image_url?: string | null;

  @IsOptional()
  @IsNumber()
  env_id?: number | null;

  @IsOptional()
  @IsNumber()
  category_id?: number | null;
}
