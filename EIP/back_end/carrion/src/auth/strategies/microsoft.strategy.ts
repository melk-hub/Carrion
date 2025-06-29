import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { Profile } from 'passport';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

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
    profile: Profile & { _json?: any; userPrincipalName?: string },
    done: (err: any, user: any, info?: any) => void,
  ) {
    const rawEmail =
      (profile.emails && profile.emails[0]?.value) ||
      profile.userPrincipalName ||
      profile._json?.mail;

    const providerId = profile.id;

    if (!rawEmail || !providerId) {
      return done(
        new UnauthorizedException(
          'Could not retrieve essential information from Microsoft profile.',
        ),
        false,
      );
    }

    const oauthEmail = rawEmail.toLowerCase();

    const { displayName, name } = profile;
    let loggedInUserId: string | undefined = undefined;
    let isLinkFlow = false;
    const state = req.query.state;

    if (state && typeof state === 'string') {
      try {
        const decodedState = this.jwtService.verify(state);
        if (decodedState && decodedState.sub) {
          loggedInUserId = decodedState.sub;
          isLinkFlow = true;
        }
      } catch (e) {
        console.error('Error verifying state token:', e.message);
      }
    }

    const oauthProfile: CreateUserDto = {
      username: displayName || oauthEmail.split('@')[0],
      email: oauthEmail,
      password: '',
      hasProfile: true,
      firstName: name?.givenName || '',
      lastName: name?.familyName || '',
    };

    try {
      const user = await this.authService.validateOAuthUser(
        'Microsoft_oauth2',
        providerId,
        oauthProfile,
        loggedInUserId,
      );

      return done(null, {
        ...user,
        oauthEmail: oauthEmail,
        accessToken,
        refreshToken,
        isLinkFlow,
        providerId,
      });
    } catch (err) {
      return done(err, false);
    }
  }
}
