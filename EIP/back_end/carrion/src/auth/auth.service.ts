import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private users = []; // VALEUR STOCKÉE EN LOCAL, À REPLACER AVEC LA DB

  constructor(private jwtService: JwtService) {}

  async signUp(email: string, password: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(password, 10);
    this.users.push({ email, password: hashedPassword });
  }

  async signIn(email: string, password: string): Promise<{ accessToken: string }> {
    const user = this.users.find((user) => user.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
}
