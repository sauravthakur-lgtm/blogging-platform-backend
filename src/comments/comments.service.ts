import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    blogId: number,
    userId: number,
    createCommentDto: CreateCommentDto,
  ) {
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        blogId,
        userId,
      },
    });
  }



  async findAll(blogId: number) {
  const blog = await this.prisma.blog.findUnique({
    where: { id: blogId },
  });

  if (!blog) {
    throw new NotFoundException('Blog not found');
  }

  return this.prisma.comment.findMany({
    where: {
      blogId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async update(
  id: number,
  content: string,
  userId: number,
) {
  const comment = await this.prisma.comment.findUnique({
    where: { id },
  });

  if (!comment) {
    throw new NotFoundException('Comment not found');
  }

  if (comment.userId !== userId) {
    throw new ForbiddenException(
      'You can only update your own comment',
    );
  }

  return this.prisma.comment.update({
    where: { id },
    data: {
      content,
    },
  });
}
async remove(id: number, userId: number) {
  const comment = await this.prisma.comment.findUnique({
    where: { id },
  });

  if (!comment) {
    throw new NotFoundException('Comment not found');
  }

  if (comment.userId !== userId) {
    throw new ForbiddenException(
      'You can only delete your own comment',
    );
  }

  return this.prisma.comment.delete({
    where: { id },
  });
}
}