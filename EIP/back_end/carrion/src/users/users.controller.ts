import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('fullname')
  addFullName(@Body() body: { firstName: string; lastName: string }) {
    const { firstName, lastName } = body;
    return this.usersService.addUserFullName(firstName, lastName);
  }
}
