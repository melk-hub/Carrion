import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'identifier',
    });
  }

  async validate(identifier: string, password: string) {
    if (!password) {
      throw new UnauthorizedException('Please provide the password');
    }

    const isEmail = this.isEmail(identifier);
    const user = await this.authService.validateUser(
      identifier,
      password,
      isEmail,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  private isEmail(value: string): boolean {
    // Vérification simple si l'entrée contient "@" (email)
    return /\S+@\S+\.\S+/.test(value);
  }
}
