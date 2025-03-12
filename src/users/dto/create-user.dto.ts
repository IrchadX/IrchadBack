/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/users/dto/create-user.dto.ts
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  familyName?: string;

  @IsOptional()
  @IsString()
  email?: string;
  //testets
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsInt()
  @Min(0)
  @Max(120)
  @IsOptional()
  age?: number;

  @IsString()
  @IsOptional()
  sex?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  street?: string;
  @IsOptional()
  userTypeId?: number;
}
