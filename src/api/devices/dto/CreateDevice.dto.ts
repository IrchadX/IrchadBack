/* eslint-disable prettier/prettier */
import {  IsBoolean, IsInt, IsISO8601, IsMACAddress, IsNotEmpty, IsString } from "class-validator";

export class CreateDeviceDto {
  @IsInt()
  @IsNotEmpty()
  type_id: number;
  
  @IsString()
  @IsNotEmpty()
  software_version: string;

  @IsISO8601()
  @IsNotEmpty()
  date_of_service: string;

  @IsInt()
  @IsNotEmpty()
  state_type_id: number;

  @IsMACAddress()
  @IsNotEmpty()
  mac_address: string;

  @IsInt() 
  user_id: number | null;

  @IsNotEmpty()
  @IsBoolean()
  comm_state: boolean;
}