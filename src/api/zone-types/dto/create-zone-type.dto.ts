import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
  IsBoolean,
} from 'class-validator';

export enum ZonePriority {
  LOW = 'Basse',
  MEDIUM = 'Moyenne',
  HIGH = 'Haute',
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

  @IsBoolean()
  @IsOptional()
  accessible?: boolean;
}
