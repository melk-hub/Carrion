import { Controller, Get, HttpCode, HttpStatus, Post, Req, Request, Res, UseGuards, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local/local-auth.guard';
import { RefreshAuthGuard } from './guards/refresh/refresh-auth.guard';
import { JwtAuthGuard } from './guards/jwt/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { GoogleAuthGuard } from './guards/google/google-auth.guard';
import { CreateUserDto, LoginDto } from 'src/user/dto/create-user.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MicrosoftAuthGuard } from './guards/microsoft/microsoft-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  @ApiOperation({ summary: 'User sign in' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully signed in',
    schema: {
      example: {
        accessToken: 'string',
      },
    },
  })
  async login(@Request() req) {
    return (await this.authService.login(req.user.id)).accessToken;
  }

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'User signup' })
  @ApiResponse({
    status: 201,
    description: 'Successfully created a new user',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request, validation error or user already exists',
  })
  async signUp(@Body() createUserDto: CreateUserDto) {
    return (await this.authService.signUp(createUserDto)).accessToken;
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiResponse({
    status: 200,
    description: 'Successfully refreshed the token',
    schema: {
      example: {
        accessToken: 'string',
      },
    },
  })
  refreshToken(@Req() req) {
    return this.authService.refreshToken(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('signout')
  @ApiOperation({ summary: 'User sign out' })
  @ApiResponse({
    status: 200,
    description: 'Successfully signed out the user',
  })
  signOut(@Req() req) {
    this.authService.signOut(req.user.id);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  @ApiOperation({ summary: 'Google login initiation' })
  @ApiResponse({ status: 200, description: 'Redirects to Google login page'})
  googleLogin() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  @ApiOperation({ summary: 'Google login callback' })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in with Google',
    schema: {
      example: {
        accessToken: 'string',
      },
    },
  })
  async googleCallback(@Req() req, @Res() res) {
    const response = await this.authService.login(req.user.id);
    res.redirect(`http://localhost:3030?token=${response.accessToken}`);
  }

  @Public()
  @UseGuards(MicrosoftAuthGuard)
  @Get('microsoft/login')
  @ApiOperation({ summary: 'Microsoft login initiation' })
  @ApiResponse({
    status: 200,
    description: 'Redirects to Microsoft login page',
  })
  microsoftLogin() {}

  @Public()
  @UseGuards(MicrosoftAuthGuard)
  @Get('microsoft/callback')
  @ApiOperation({ summary: 'Microsoft login callback' })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in with Microsoft',
    schema: {
      example: {
        accessToken: 'string',
      },
    },
  })
  async microsoftCallback(@Req() req, @Res() res) {
    const response = await this.authService.login(req.user.id);
    //res.redirect(`http://localhost:3030?token=${response.accessToken}`);
  }
}
