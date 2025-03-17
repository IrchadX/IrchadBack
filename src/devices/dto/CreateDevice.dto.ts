/* eslint-disable prettier/prettier */
import {  IsInt, IsISO8601, IsMACAddress, IsString } from "class-validator";

export class CreateDeviceDto {
  @IsInt()
  TypeId: number;
  @IsString()
  SoftwareVersion: string;
  // iso8601 means the date format is the following yyyy-MM-dd
  @IsISO8601()
  DateOfService: string;
  @IsInt()
  InitialStateId: number;
  @IsMACAddress()
  MacAddress: string;
  @IsInt({message : "Le niveau de la batterie doit etre un entier"})
  BatteryLevel: number;
  @IsString()
  UserFirstName: string;
  @IsString()
  UserLastName: string;
}