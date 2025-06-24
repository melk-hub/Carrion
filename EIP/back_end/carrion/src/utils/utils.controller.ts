import {
  Controller,
  Get,
  HttpStatus,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt/jwt-auth.guard';
import { UtilsService } from './utils.service';

interface countryBody {
  inputValue: string;
}

@Controller('utils')
export class UtilsController {
  constructor(private readonly utilsService: UtilsService) {}
  @UseGuards(JwtAuthGuard)
  @Post('countryList')
  async returnCountryList(@Request() req, @Response() res) {
    const body: countryBody = req.body;
    return res
      .status(HttpStatus.OK)
      .json(await this.utilsService.getCountryList(body.inputValue));
  }

  @UseGuards(JwtAuthGuard)
  @Get('hasProfile')
  async hasProfile(@Request() req, @Response() res) {
    return res
      .status(HttpStatus.OK)
      .json(await this.utilsService.hasProfile(req.user.id));
  }
}
