import { IsBoolean, IsInt, IsISO8601, IsMACAddress, IsOptional, IsString } from "class-validator";

export class UpdateDeviceDto {
      @IsString()
      @IsOptional()
      software_version?: string;
    
      @IsISO8601()
      @IsOptional()
      date_of_service?: string;
    
      @IsInt()
      @IsOptional()
      state_type_id?: number;
    
      @IsMACAddress()
      @IsOptional()
      mac_address?: string;
    
      @IsInt() 
      @IsOptional()
      user_id?: number;
    
      @IsBoolean()
      @IsOptional()
      comm_state?: boolean;
}
