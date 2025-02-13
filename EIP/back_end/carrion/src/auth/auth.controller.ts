import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
  Body,
  Response,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local/local-auth.guard';
import { RefreshAuthGuard } from './guards/refresh/refresh-auth.guard';
import { JwtAuthGuard } from './guards/jwt/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { GoogleAuthGuard } from './guards/google/google-auth.guard';
import { CreateUserDto, LoginDto } from 'src/user/dto/create-user.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MicrosoftAuthGuard } from './guards/microsoft/microsoft-auth.guard';
import { GoogleLoginDto } from 'src/user/dto/google-login.dto';

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
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async login(@Request() req, @Res() res) {
    const token = await this.authService.login(req.user.id);

    res.cookie('access_token', token.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 1000 * 60 * 60 * 24,
    });
    return res.status(HttpStatus.OK).send();
  }

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'User signup' })
  @ApiResponse({
    status: 200,
    description: 'Successfully created a new user',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request, validation error or user already exists',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({
    status: 409,
    description: 'User with the same email or username',
  })
  async signUp(@Body() createUserDto: CreateUserDto, @Res() res) {
    const token = await this.authService.signUp(createUserDto);

    res.cookie('access_token', token.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 1000 * 60 * 60 * 24,
    });
    return res.status(HttpStatus.OK).send();
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
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
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
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google login with authorization code' })
  @ApiResponse({
    status: 200,
    description: 'Returns access token',
    schema: {
      example: {
        accessToken: 'string',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiBody({ type: GoogleLoginDto })
  async googleLogin(@Body() code, @Req() req, @Res() res) {
    try {
      const user = req.user;
      const tokens = await this.authService.login(user.id);

      res.cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24,
      });

      res.redirect(`${process.env.FRONT}/login`);
    } catch (error) {
      res
        .status(400)
        .json({ message: `Failed to authenticate with Google ${error}` });
    }
  }

  @Public()
  @UseGuards(MicrosoftAuthGuard)
  @Get('microsoft/login')
  @ApiOperation({ summary: 'Microsoft login initiation' })
  @ApiResponse({
    status: 200,
    description: 'Redirects to Microsoft login page',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  microsoftLogin() {}

  // @Public()
  // @UseGuards(MicrosoftAuthGuard)
  // @Get('microsoft/callback')
  // @ApiOperation({ summary: 'Microsoft login callback' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Successfully logged in with Microsoft',
  //   schema: {
  //     example: {
  //       accessToken: 'string',
  //     },
  //   },
  // })
  // async microsoftCallback(@Req() req, @Res() res) {
  //   const response = await this.authService.login(req.user.id);
  //res.redirect(`${process.env.FRONT}?token=${response.accessToken}`);
  // }
  @Public()
  @Get('logout')
  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged',
    schema: {
      example: {
        accessToken: 'string',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  logout(@Response() res) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.status(HttpStatus.OK).json({ message: 'Logout successful' });
  }

  @Public()
  @Get('check')
  @ApiOperation({ summary: 'Check login' })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged',
    schema: {
      example: {
        accessToken: 'string',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async checkAuth(@Request() req, @Response() res) {
    try {
      const token = req.res.req.cookies['access_token'];
      if (!token) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const user = await this.authService.validateCookie(token);
      if (!user) {
        return res.status(401).json({ message: 'Token invalide' });
      }

      // Authentification réussie
      return res.status(200).json({ message: 'Authenticated' });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Server error: ${error.message}` });
    }
  }
}
