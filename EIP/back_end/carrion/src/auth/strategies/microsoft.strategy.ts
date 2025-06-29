import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {
    super({
      passReqToCallback: true,
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: process.env.MICROSOFT_REDIRECT_URI,
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

    let loggedInUserId: string | undefined = undefined;

    const state = req.query.state;
    if (state) {
      try {
        const decodedState = this.jwtService.verify(state);
        if (decodedState && decodedState.sub) {
          loggedInUserId = decodedState.sub;
        }
      } catch (e) {
        console.error(e);
      }
    }

    try {
      const user = await this.authService.validateOAuthUser(
        {
          username: profile.displayName || 'user',
          email: email,
          password: '',
          hasProfile: true,
          firstName: profile?.name.givenName || '',
          lastName: profile?.name.familyName || '',
        },
        loggedInUserId,
      );
      return done(null, { ...user, accessToken, refreshToken });
    } catch (err) {
      return done(err, false);
    }
  }
}
