import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '@/user/dto/create-user.dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {
    super({
      passReqToCallback: true,
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
      scope: [
        'email',
        'profile',
        'https://www.googleapis.com/auth/gmail.readonly',
      ],
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<any> {
    if (!profile.emails || !profile.emails[0]?.value || !profile.id) {
      throw new UnauthorizedException(
        'Could not retrieve Google profile information.',
      );
    }

    const { id: providerId, name, emails } = profile;
    const oauthEmail = emails[0].value.toLowerCase();

    const state = req.query.state;
    let loggedInUserId: string | undefined = undefined;
    let isLinkFlow = false;
    if (state && typeof state === 'string') {
      try {
        const decodedState = this.jwtService.verify(state);
        if (decodedState?.sub) {
          loggedInUserId = decodedState.sub;
          isLinkFlow = true;
        }
      } catch (e) {
        /* ignore */
      }
    }

    const oauthProfile: CreateUserDto = {
      username: name.givenName || oauthEmail.split('@')[0],
      email: oauthEmail,
      password: '',
      hasProfile: true,
      firstName: name.givenName || '',
      lastName: name.familyName || '',
    };

    const user = await this.authService.validateOAuthUser(
      'Google_oauth2',
      providerId,
      oauthProfile,
      loggedInUserId,
    );

    return {
      ...user,
      oauthEmail,
      accessToken,
      refreshToken,
      isLinkFlow,
      providerId,
    };
  }
}
