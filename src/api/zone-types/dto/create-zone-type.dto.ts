import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
} from 'class-validator';

export enum ZonePriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export class CreateZoneTypeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  type: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  color: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @IsEnum(ZonePriority)
  @IsOptional()
  priority?: ZonePriority;

  @IsString()
  @IsOptional()
  accessibility?: string;
}
