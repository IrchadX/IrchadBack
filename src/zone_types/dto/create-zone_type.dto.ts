import { IsString } from 'class-validator';

export class CreateZoneTypeDto {
  @IsString()
  type: string;

  @IsString()
  color: string;

  @IsString()
  icon: string;
}
