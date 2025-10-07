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
  Param,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { GoogleAuthGuard } from './guards/google/google-auth.guard';
import { CreateUserDto } from '@/user/dto/create-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MicrosoftAuthGuard } from './guards/microsoft/microsoft-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  @ApiOperation({ summary: 'User sign in' })
  async login(@Request() req, @Res() res) {
    const { rememberMe = false } = req.body;
    const tokens = await this.authService.login(req.user.id, rememberMe);
    const cookieMaxAge = rememberMe
      ? 1000 * 60 * 60 * 24 * 15
      : 1000 * 60 * 60 * 24;
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: cookieMaxAge,
    });
    return res
      .status(HttpStatus.OK)
      .send({ message: 'User logged in successfully' });
  }

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'User signup' })
  async signUp(@Body() userInfo: CreateUserDto, @Res() res) {
    const tokens = await this.authService.signUp(userInfo);
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 1000 * 60 * 60 * 24,
    });
    return res
      .status(HttpStatus.OK)
      .send({ message: 'User created successfully' });
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT token' })
  async refreshAccessToken(@Req() req, @Res() res) {
    try {
      const refreshToken = req.cookies?.['refresh_token'];
      if (!refreshToken)
        return res.status(401).json({ message: 'No refresh token provided' });
      const tokens = await this.authService.refreshTokens(refreshToken);
      if (!tokens)
        return res.status(401).json({ message: 'Invalid refresh token' });
      res.cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
      if (tokens.refreshToken) {
        res.cookie('refresh_token', tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 1000 * 60 * 60 * 24 * 30,
        });
      }
      return res.status(200).json({ message: 'Token refreshed successfully' });
    } catch (error) {
      Logger.error(error);
      return res.status(401).json({ message: 'Token refresh failed' });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('signout')
  @ApiOperation({ summary: 'User sign out' })
  signOut(@Req() req, @Res() res) {
    this.authService.signOut(req.user.id);
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return res.status(HttpStatus.OK).json({ message: 'Signout successful' });
  }

  @Public()
  @Get('logout')
  @ApiOperation({ summary: 'Logout' })
  logout(@Response() res) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return res.status(HttpStatus.OK).json({ message: 'Logout successful' });
  }

  @Public()
  @Get('check')
  @ApiOperation({ summary: 'Check login status' })
  async checkAuth(@Request() req, @Response() res) {
    try {
      const token = req.cookies['access_token'];
      if (!token) return res.status(200).json({ isAuthenticated: false });
      const user = await this.authService.validateCookie(token);
      if (!user) return res.status(200).json({ isAuthenticated: false });
      return res.status(200).json({ isAuthenticated: true, user });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Server error: ${error.message}` });
    }
  }

  @Get('google/link')
  @UseGuards(JwtAuthGuard)
  linkGoogleAccount(@Req() req, @Res() res) {
    const stateToken = this.jwtService.sign(
      { sub: req.user.id },
      { expiresIn: '5m' },
    );
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      scope:
        'email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.labels',
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      state: stateToken,
    });
    res.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    );
  }

  @Get('microsoft/link')
  @UseGuards(JwtAuthGuard)
  linkMicrosoftAccount(@Req() req, @Res() res) {
    const stateToken = this.jwtService.sign(
      { sub: req.user.id },
      { expiresIn: '5m' },
    );
    const params = new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID,
      redirect_uri: process.env.MICROSOFT_REDIRECT_URI,
      scope: 'openid profile offline_access User.Read Mail.Read',
      response_type: 'code',
      response_mode: 'query',
      state: stateToken,
    });
    res.redirect(
      `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`,
    );
  }

  @Public()
  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  googleLoginInitiate() {}

  @Public()
  @Get('microsoft/login')
  @UseGuards(AuthGuard('microsoft'))
  microsoftLoginInitiate() {}

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req, @Res() res) {
    const user = req.user as any;
    if (!user || user.redirected) return;
    const twentyFiveMinutesInDays = 25 / (60 * 24);
    await this.authService.saveTokens(
      user.id,
      user.accessToken,
      user.refreshToken || '',
      twentyFiveMinutesInDays,
      'Google_oauth2',
      user.providerId,
      user.oauthEmail,
    );
    try {
      await this.authService.createGmailWebhook(user.accessToken, user.id);
    } catch (error) {
      Logger.error(error);
    }
    if (user.isLinkFlow)
      return res.redirect(`${process.env.FRONT}/profile?link_success=google`);
    const tokens = await this.authService.login(user.id);
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    if (tokens.refreshToken) {
      res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 30,
      });
    }
    res.redirect(`${process.env.FRONT}/?auth=success`);
  }

  @Public()
  @Get('microsoft/callback')
  @UseGuards(MicrosoftAuthGuard)
  async microsoftCallback(@Req() req, @Res() res) {
    const user = req.user as any;
    if (!user || user.redirected) return;
    const twentyFiveMinutesInDays = 25 / (60 * 24);
    await this.authService.saveTokens(
      user.id,
      user.accessToken,
      user.refreshToken || '',
      twentyFiveMinutesInDays,
      'Microsoft_oauth2',
      user.providerId,
      user.oauthEmail,
    );
    try {
      await this.authService.createOutlookWebhook(user.accessToken, user.id);
    } catch (error) {
      Logger.error(error);
    }
    if (user.isLinkFlow)
      return res.redirect(
        `${process.env.FRONT}/profile?link_success=microsoft`,
      );
    const tokens = await this.authService.login(user.id);
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    if (tokens.refreshToken) {
      res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 30,
      });
    }
    res.redirect(`${process.env.FRONT}/?auth=success`);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send password reset link' })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.forgotPassword(forgotPasswordDto.email);
    return {
      message:
        'If an account with this email exists, a reset link has been sent.',
    };
  }

  @Public()
  @Post('reset-password/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset user password' })
  async resetPassword(
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.resetPassword(token, resetPasswordDto);
    return { message: 'Your password has been reset successfully.' };
  }
}
