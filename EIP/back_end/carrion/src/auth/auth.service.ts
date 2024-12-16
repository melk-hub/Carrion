import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async signUp(
    email: string,
    password: string,
    username: string,
    firstname: string,
    lastname: string,
  ): Promise<void> {
    const existingUserEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUserEmail) {
      throw new UnauthorizedException('Email already in use');
    }
    const existingUsername = await this.prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      throw new UnauthorizedException('Username already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await this.prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          firstname,
          lastname,
        },
      });
    } catch (error) {
      if (error instanceof this.prisma.handleKnownErrors) {
        throw new UnauthorizedException('Unique constraint failed');
      }
      throw error;
    }
  }

  async signIn(
    username: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    try {
      const loginField = username.includes('@') ? 'email' : 'username';
      let user;
      if (loginField === 'email') {
        user = await this.prisma.user.findUnique({
          where: { email: username },
        });
      } else if (loginField === 'username') {
        user = await this.prisma.user.findUnique({
          where: { username },
        });
      }
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = { email: user.email };
      const accessToken = this.jwtService.sign(payload);

      return { accessToken };
    } catch (error) {
      console.error('Error during signIn:', error);
    }
  }
}
