import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

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
      scope: ['email', 'profile'],
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ) {
    if (!profile.emails || !profile.emails[0]?.value || !profile.id) {
      return done(
        new UnauthorizedException(
          'Could not retrieve Google profile information.',
        ),
        false,
      );
    }

    const { id: providerId, name, emails } = profile;
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
        console.log(e);
      }
    }

    const oauthProfile: CreateUserDto = {
      username: name.givenName || emails[0].value.split('@')[0],
      email: emails[0].value,
      password: '',
      hasProfile: true,
      firstName: name.givenName || '',
      lastName: name.familyName || '',
    };

    try {
      const user = await this.authService.validateOAuthUser(
        'Google_oauth2',
        providerId,
        oauthProfile,
        loggedInUserId,
      );

      return done(null, {
        ...user,
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
