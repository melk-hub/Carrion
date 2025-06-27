import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { AuthService } from '../auth.service';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(private authService: AuthService) {
    super({
      passReqToCallback: true,
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: process.env.BACKEND_URL
        ? `${process.env.BACKEND_URL}/auth/microsoft/callback`
        : 'http://localhost:8080/auth/microsoft/callback',
      tenant: 'common',
      scope: ['openid', 'profile', 'offline_access', 'user.read', 'mail.read'],
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (err: any, user: any, info?: any) => void,
  ) {
    const email =
      (profile.emails && profile.emails[0]?.value) ||
      profile.userPrincipalName ||
      profile._json?.mail;
    if (!email) {
      return done(
        new UnauthorizedException(
          'Could not retrieve email from Microsoft profile.',
        ),
        false,
      );
    }

    try {
      const loggedInUser = req.user;
      const user = await this.authService.validateOAuthUser(
        {
          username: profile.displayName || 'user',
          email: email,
          password: '',
          hasProfile: true,
        },
        loggedInUser?.id,
      );

      return done(null, { ...user, accessToken, refreshToken });
    } catch (err) {
      return done(err, false);
    }
  }
}
