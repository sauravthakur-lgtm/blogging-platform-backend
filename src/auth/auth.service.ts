import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { randomBytes, createHash } from 'crypto';
import { LoginDto } from './dto/login.dto';
@Injectable()
export class AuthService {
  constructor(
  private readonly prisma: PrismaService,
  private readonly jwtService: JwtService,
) {} 

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;

    // 1. Check duplicate email
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Create user
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    // 4. Never return passwordHash
    return {
      message: 'Registration successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    };
  }


async login(loginDto: LoginDto) {
  const { email, password } = loginDto;

  // 1. User find karo
  const user = await this.prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new UnauthorizedException('Invalid email or password');
  }

  // 2. Check blocked user
  if (user.isBlocked) {
    throw new UnauthorizedException('User is blocked');
  }

  // 3. Password verify
  const isPasswordValid = await bcrypt.compare(
    password,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid email or password');
  }
const payload = {
  id: user.id,
  email: user.email,
  role: user.role,
};

const accessToken = this.jwtService.sign(payload);

const refreshToken = this.jwtService.sign(payload, {
  secret: process.env.JWT_REFRESH_SECRET,
  expiresIn: '7d',
});

const refreshTokenHash = createHash('sha256')
  .update(refreshToken)
  .digest('hex');
await this.prisma.refreshToken.create({
  data: {
    tokenHash: refreshTokenHash,
    userId: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
});
  // Temporary response
return {
  message: 'Login successful',
  accessToken,
  refreshToken,
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
};
}
async forgotPassword(email: string) {
  const user = await this.prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  const token = randomBytes(32).toString('hex');

  const tokenHash = createHash('sha256')
    .update(token)
    .digest('hex');

  await this.prisma.passwordResetToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  return {
    message: 'Password reset token generated',
    resetToken: token,
  };
}
  async resetPassword(token: string, newPassword: string) {
  const tokenHash = createHash('sha256')
    .update(token)
    .digest('hex');

  const resetToken = await this.prisma.passwordResetToken.findUnique({
    where: {
      tokenHash,
    },
  });

  if (!resetToken) {
    throw new UnauthorizedException('Invalid reset token');
  }

  if (resetToken.expiresAt < new Date()) {
    throw new UnauthorizedException('Reset token has expired');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await this.prisma.user.update({
    where: {
      id: resetToken.userId,
    },
    data: {
      passwordHash,
    },
  });

  await this.prisma.passwordResetToken.delete({
    where: {
      id: resetToken.id,
    },
  });

  return {
    message: 'Password reset successfully',
  };
}

async refreshAccessToken(refreshToken: string) {
  const tokenHash = createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  const storedToken = await this.prisma.refreshToken.findFirst({
    where: {
      tokenHash,
    },
  });

  if (!storedToken) {
    throw new UnauthorizedException('Invalid refresh token');
  }

  if (storedToken.expiresAt < new Date()) {
    throw new UnauthorizedException('Refresh token has expired');
  }

  const user = await this.prisma.user.findUnique({
    where: {
      id: storedToken.userId,
    },
  });

  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  if (user.isBlocked) {
    throw new UnauthorizedException('User is blocked');
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = this.jwtService.sign(payload);

  return {
    message: 'Access token refreshed successfully',
    accessToken,
  };
}
async logout(refreshToken: string) {
  const tokenHash = createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  const storedToken = await this.prisma.refreshToken.findFirst({
    where: {
      tokenHash,
    },
  });

  if (!storedToken) {
    throw new UnauthorizedException('Invalid refresh token');
  }

  await this.prisma.refreshToken.delete({
    where: {
      id: storedToken.id,
    },
  });

  return {
    message: 'Logout successful',
  };
}
}

