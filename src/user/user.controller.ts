import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @HttpCode(HttpStatus.OK)
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @HttpCode(HttpStatus.OK)
  @Patch('update')
  editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    return this.userService.editeUser(userId, dto);
  }
}
