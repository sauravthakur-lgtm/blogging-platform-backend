import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { deleteProfileFile } from './utils/upload.utils';

import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        profileImage: true,
        createdAt: true,
      },
    });

    return user;
  }
  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
  const user = await this.prisma.user.update({
    where: {
      id: userId,
    },
    data: updateProfileDto,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      profileImage: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    message: 'Profile updated successfully',
    user,
  };
}

async updateProfileImage(userId: number, file: any) {
  if (!file) {
    throw new BadRequestException('Profile image is required');
  }

  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      profileImage: true,
    },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  try {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        profileImage: file.path,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileImage: true,
      },
    });

    // Old image delete
    if (user.profileImage) {
      deleteProfileFile(user.profileImage);
    }

    return {
      message: 'Profile image updated successfully',
      user: updatedUser,
    };
  } catch (error) {
    // DB update fail hua to new uploaded file delete
    deleteProfileFile(file.path);
    throw error;
  }
}
}