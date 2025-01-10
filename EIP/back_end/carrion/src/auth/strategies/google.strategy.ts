import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
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
      scope: ['email', 'profile'],
    });
  }

  async validate( accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) {
    console.log({ profile });
    const user = await this.authService.validateOAuthUser({
      username: '',
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      email: profile.emails[0].value,
      password: '',
    });
    return user;
  }
}