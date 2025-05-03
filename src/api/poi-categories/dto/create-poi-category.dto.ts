import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePoiCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  category: string;
}
