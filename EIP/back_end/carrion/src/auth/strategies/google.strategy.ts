import { Inject, Injectable, Request } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import googleOauthConfig from '../config/google-oauth.config';
import { ConfigType } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(googleOauthConfig.KEY)
    private googleConfiguration: ConfigType<typeof googleOauthConfig>,
    private authService: AuthService,
  ) {
    super({
      clientID: googleConfiguration.clientID,
      clientSecret: googleConfiguration.clientSecret,
      callbackURL: googleConfiguration.callbackURL,
      scope: ['email', 'profile', 'https://www.googleapis.com/auth/gmail.readonly'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const user = accessToken;
    const client = await this.authService.validateOAuthUser({
      firstName: profile.name.givenName ?? null,
      lastName: profile.name.familyName ?? 'Doe',
      username: profile.name.givenName,
      email: profile.emails[0].value,
      birthDate: null,
      password: '',
    });
    await this.authService.googleLogin(client.id, refreshToken);
    return user;
  }
}
