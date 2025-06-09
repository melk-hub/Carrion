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
  BadRequestException,
  Param,
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
import { CustomLoggingService, LogCategory } from 'src/common/services/logging.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private logger: CustomLoggingService,
  ) {}

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
    const body = req.body;
    // Stay 15 days if rememberMe is true, otherwise 1 day
    const tokenTime = body.rememberMe
      ? 1000 * 60 * 60 * 24 * 15
      : 1000 * 60 * 60 * 24;

    res.cookie('access_token', token.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: tokenTime,
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
    description: 'Returns Google access token',
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
      // Check for OAuth2 errors in query parameters first
      const { error, error_description } = req.query;

      if (error) {
        this.logger.logAuthEvent(
          `Google OAuth2 error: ${error} - ${error_description}`,
          undefined,
          { error, error_description, query: req.query },
        );

        // Handle different types of OAuth2 errors
        let errorMessage = 'Authentication failed';
        switch (error) {
          case 'access_denied':
            errorMessage = 'Authentication was cancelled by user';
            break;
          case 'invalid_request':
            errorMessage = 'Invalid authentication request';
            break;
          case 'unauthorized_client':
            errorMessage = 'Unauthorized client application';
            break;
          case 'unsupported_response_type':
            errorMessage = 'Unsupported response type';
            break;
          case 'invalid_scope':
            errorMessage = 'Invalid scope requested';
            break;
          case 'server_error':
            errorMessage = 'Google server error occurred';
            break;
          case 'temporarily_unavailable':
            errorMessage = 'Google service temporarily unavailable';
            break;
          default:
            errorMessage = error_description || 'Authentication failed';
        }

        // Redirect to frontend with error
        return res.redirect(
          `${process.env.FRONT}/login?error=${encodeURIComponent(errorMessage)}`,
        );
      }

      const user = req.user;

      if (!user) {
        return res.redirect(
          `${process.env.FRONT}/login?error=${encodeURIComponent(
            'Authentication failed - no user data',
          )}`,
        );
      }

      const tokens = await this.authService.login(user.id);

      await this.authService.saveTokens(
        user.id,
        user.accessToken,
        user.refreshToken || '',
        7,
        'Google_oauth2',
      );
      await this.authService.createGmailWebhook(user.accessToken, user.id);

      res.cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24,
      });

      res.redirect(`${process.env.FRONT}/auth/callback?auth=success`);
    } catch (error) {
      this.logger.error('Google authentication error', undefined, LogCategory.AUTH, { error: error.message });
      return res.redirect(`${process.env.FRONT}?error=server_error&errorDescription=Authentication failed`);
    }
  }

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

      return res.status(200).json({ message: 'Authenticated' });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Server error: ${error.message}` });
    }
  }

  @Public()
  @Get('microsoft/callback')
  @ApiOperation({ summary: 'Microsoft login with authorization code' })
  @ApiResponse({
    status: 200,
    description: 'Returns Microsoft access token',
    schema: {
      example: {
        accessToken: 'string',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async microsoftLogin(@Req() req, @Res() res) {
    try {
      // Check for OAuth2 errors in query parameters first
      const { error, error_description } = req.query;

      if (error) {
        this.logger.logAuthEvent(
          `Microsoft OAuth2 error: ${error} - ${error_description}`,
          undefined,
          { error, error_description, query: req.query },
        );

        // Handle different types of OAuth2 errors
        let errorMessage = 'Authentication failed';
        switch (error) {
          case 'access_denied':
            errorMessage = 'Authentication was cancelled by user';
            break;
          case 'invalid_request':
            errorMessage = 'Invalid authentication request';
            break;
          case 'unauthorized_client':
            errorMessage = 'Unauthorized client application';
            break;
          case 'unsupported_response_type':
            errorMessage = 'Unsupported response type';
            break;
          case 'invalid_scope':
            errorMessage = 'Invalid scope requested';
            break;
          case 'server_error':
            errorMessage = 'Microsoft server error occurred';
            break;
          case 'temporarily_unavailable':
            errorMessage = 'Microsoft service temporarily unavailable';
            break;
          default:
            errorMessage = error_description || 'Authentication failed';
        }

        // Redirect to frontend with error
        return res.redirect(
          `${process.env.FRONT}/login?error=${encodeURIComponent(errorMessage)}`,
        );
      }

      // If there's a code and no error, apply the Microsoft guard
      const code = req.query.code;
      if (code) {
        // Use the Microsoft guard to handle the OAuth2 code exchange
        const microsoftGuard = new MicrosoftAuthGuard();
        const canActivate = await microsoftGuard.canActivate({
          switchToHttp: () => ({
            getRequest: () => req,
            getResponse: () => res,
          }),
        } as any);

        if (!canActivate) {
          throw new Error('Microsoft authentication failed');
        }
      }

      const user = req.user;

      if (!user) {
        return res.redirect(
          `${process.env.FRONT}/login?error=${encodeURIComponent(
            'Authentication failed - no user data',
          )}`,
        );
      }

      const tokens = await this.authService.login(user.id);

      await this.authService.saveTokens(
        user.id,
        user.accessToken,
        user.refreshToken || '',
        7,
        'Microsoft_oauth2',
      );
      await this.authService.createOutlookWebhook(user.accessToken, user.id);

      res.cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24,
      });

      res.redirect(`${process.env.FRONT}/auth/callback?auth=success`);
    } catch (error) {
      this.logger.error('Microsoft authentication error', undefined, LogCategory.AUTH, { error: error.message });
      return res.redirect(`${process.env.FRONT}?error=server_error&errorDescription=Authentication failed`);
    }
  }
}
