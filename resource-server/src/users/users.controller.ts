import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AudienceGuard } from '../auth/guards/audience.guard';
import { HydraAuthGuard } from '../auth/guards/hydra-auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto, CreateUserDtoResponse } from './dto/create-user.dto';
import { DeleteUserDto, DeleteUserDtoResponse } from './dto/delete-user.dto';

@UseGuards(HydraAuthGuard, AudienceGuard)
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
