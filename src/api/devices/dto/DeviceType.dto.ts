/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString } from "class-validator";

export class DeviceTypeDto {
    @IsString()
    @IsNotEmpty()
  name: string;
}