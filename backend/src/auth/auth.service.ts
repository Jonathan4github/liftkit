import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.merchant.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const merchant = await this.prisma.merchant.create({
      data: { email: dto.email, password: passwordHash },
    });

    return this.signToken(merchant.id, merchant.email);
  }

  async login(dto: LoginDto) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { email: dto.email },
    });
    if (!merchant) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, merchant.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.signToken(merchant.id, merchant.email);
  }

  private async signToken(merchantId: string, email: string) {
    const accessToken = await this.jwt.signAsync({ sub: merchantId, email });
    return { accessToken };
  }
}
