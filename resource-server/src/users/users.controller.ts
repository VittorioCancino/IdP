import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, CreateUserDtoResponse } from './dto/create-user.dto';
import { DeleteUserDto, DeleteUserDtoResponse } from './dto/delete-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers() {
    return this.usersService.getUsers();
  }

  @Post()
  createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<CreateUserDtoResponse> {
    return this.usersService.createUser(createUserDto);
  }

  @Delete(':id')
  deleteUser(
    @Param() deleteUserDto: DeleteUserDto,
  ): Promise<DeleteUserDtoResponse> {
    return this.usersService.deleteUser(deleteUserDto);
  }
}
