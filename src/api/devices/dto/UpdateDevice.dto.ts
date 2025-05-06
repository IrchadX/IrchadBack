import { IsBoolean, IsInt, IsISO8601, IsMACAddress, IsOptional, IsString } from "class-validator";
import { Transform } from 'class-transformer';

export class UpdateDeviceDto {
  @IsString()
  @IsOptional()
  software_version?: string;

  @IsISO8601()
  @IsOptional()
  @Transform(({ value }) => new Date(value).toISOString()) 
  date_of_service?: string; // Added the question mark here to make it optional

  @IsInt()
  @IsOptional()
  @Transform(({ value }) => Number(value)) 
  state_type_id?: number;

  @IsMACAddress()
  @IsOptional()
  mac_address?: string;

  @IsInt() 
  @IsOptional()
  @Transform(({ value }) => Number(value)) 
  user_id?: number;
 
  @IsBoolean()
  @IsOptional()
  comm_state?: boolean;
  
  @IsInt() 
  @IsOptional()
  @Transform(({ value }) => Number(value)) 
  battery_capacity?: number;
  @IsInt() 
  @IsOptional()
  @Transform(({ value }) => Number(value)) 
  type_id?: number;

  
}