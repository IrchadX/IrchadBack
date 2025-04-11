/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// src/users/users.controller.ts
import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async getUsers(
    @Query('search') search?: string,
    @Query('sex') sex?: string,
    @Query('city') city?: string,
    @Query('ageGroup') ageGroup?: string,
    @Query('userType') userType?: string,
  ) {
    const filters = {
      sex,
      city,
      ageGroup,
      userType,
    };

    // Remove undefined values
    Object.keys(filters).forEach((key) => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    return this.usersService.findAll(search, filters);
  }

  @Get('by-type')
  async getUsersByType(
    @Query('type') type: string, // Accept multiple types as a comma-separated string
    @Query('search') search?: string,
  ) {
    if (!type) {
      throw new Error('Le paramètre "type" est requis.');
    }
  
    const types = type.split(','); // Split the types into an array
    const filters = {
      userType: types, 
    };
  
    return this.usersService.findAll(search, filters);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(Number(id), updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Patch(':id/update-password')
  async updatePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.usersService.updatePassword(id, currentPassword, newPassword);
  }
}