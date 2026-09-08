import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) {}

  async like(blogId: number, userId: number) {
    // 1. Check blog exists
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    // 2. Check already liked
    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_blogId: {
          userId,
          blogId,
        },
      },
    });

    if (existingLike) {
      throw new ConflictException('Blog already liked');
    }

    // 3. Create like
    return this.prisma.like.create({
      data: {
        userId,
        blogId,
      },
    });
  }
  async unlike(blogId: number, userId: number) {
  const like = await this.prisma.like.findUnique({
    where: {
      userId_blogId: {
        userId,
        blogId,
      },
    },
  });

  if (!like) {
    throw new NotFoundException('Like not found');
  }

  return this.prisma.like.delete({
    where: {
      id: like.id,
    },
  });
}
}