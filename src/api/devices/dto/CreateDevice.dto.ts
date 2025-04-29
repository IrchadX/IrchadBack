import { IsBoolean, IsInt, IsISO8601, IsMACAddress, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Transform } from 'class-transformer';

export class CreateDeviceDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value)) 
  type_id: number;

  @IsString()
  @IsNotEmpty()
  software_version: string;

  @IsISO8601()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value).toISOString()) 
  date_of_service: string;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value)) 
  state_type_id: number;

  @IsMACAddress()
  @IsNotEmpty()
  mac_address: string;

  @IsInt()
@IsOptional()
@Transform(({ value }) => {
  if (value === '' || value === undefined || value === null) {
    return null;
  }
  return Number(value);
}) 
user_id: number | null;

  @IsNotEmpty()
  @IsBoolean()
  comm_state: boolean;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value)) 
  battery_capacity: number;
}