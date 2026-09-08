import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        isBlocked: true,
        profileImage: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async blockUser(userId: number) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const updatedUser = await this.prisma.user.update({
    where: { id: userId },
    data: {
      isBlocked: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBlocked: true,
    },
  });

  return {
    message: 'User blocked successfully',
    user: updatedUser,
  };
}
async unblockUser(userId: number) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const updatedUser = await this.prisma.user.update({
    where: { id: userId },
    data: {
      isBlocked: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBlocked: true,
    },
  });

  return {
    message: 'User unblocked successfully',
    user: updatedUser,
  };
}
async deleteUser(userId: number) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  await this.prisma.user.delete({
    where: { id: userId },
  });

  return {
    message: 'User deleted successfully',
  };
}
async deleteBlog(blogId: number) {
  const blog = await this.prisma.blog.findUnique({
    where: { id: blogId },
  });

  if (!blog) {
    throw new NotFoundException('Blog not found');
  }

  await this.prisma.blog.delete({
    where: { id: blogId },
  });

  return {
    message: 'Blog deleted successfully',
  };
}
}