import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowsService {
  constructor(private readonly prisma: PrismaService) {}

  async follow(followingId: number, followerId: number) {
    // Target user exist karta hai ya nahi
    const user = await this.prisma.user.findUnique({
      where: {
        id: followingId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Khud ko follow nahi kar sakte
    if (followingId === followerId) {
      throw new ForbiddenException(
        'You cannot follow yourself',
      );
    }

    // Already following?
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      throw new ConflictException(
        'User already followed',
      );
    }

    // Follow create
    return this.prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });
  }
  async unfollow(followingId: number, followerId: number) {
  const follow = await this.prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  if (!follow) {
    throw new NotFoundException('You are not following this user');
  }

  return this.prisma.follow.delete({
    where: {
      id: follow.id,
    },
  });
}
}