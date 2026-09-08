import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { deleteFile } from './utils/upload.utils';
import { QueryBlogDto } from './dto/query-blog.dto';
@Injectable()
export class BlogsService {
  constructor(private readonly prisma: PrismaService) {}

 async create(
  createBlogDto: CreateBlogDto,
  userId: number,
  file?: any,
) {
    const { title, content } = createBlogDto;

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-');

    return this.prisma.blog.create({
      data: {
  title,
  content,
  slug,
  coverImage: file?.path,
  authorId: userId,
},
    });
  }
  async publish(blogId: number, userId: number) {
  const blog = await this.prisma.blog.findUnique({
    where: {
      id: blogId,
    },
  });

  if (!blog) {
    throw new NotFoundException('Blog not found');
  }

  if (blog.authorId !== userId) {
    throw new ForbiddenException('You can only publish your own blog');
  }

  return this.prisma.blog.update({
    where: {
      id: blogId,
    },
    data: {
      isPublished: true,
    },
  });
}
async findAll(query: QueryBlogDto) {
  const { search, page = 1, limit = 10 } = query;

  const skip = (page - 1) * limit;

  const where: any = {
    isPublished: true,
  };

  // 👇 YE PART YAHAN LAGEGA
  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        content: {
          contains: search,
          mode: 'insensitive',
        },
      },
    ];
  }

  return this.prisma.blog.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take: limit,
  });
}

async update(
  id: number,
  updateBlogDto: UpdateBlogDto,
  userId: number,
  file?: any,
) {
  const blog = await this.prisma.blog.findUnique({
    where: { id },
  });

  if (!blog) {
    throw new NotFoundException('Blog not found');
  }

  if (blog.authorId !== userId) {
    throw new ForbiddenException(
      'You can only update your own blog',
    );
  }

  // New image upload hui hai
  if (file) {
    try {
      const updatedBlog = await this.prisma.blog.update({
        where: { id },
        data: {
          ...updateBlogDto,
          coverImage: file.path,
        },
      });

      // DB update successful hone ke baad old image delete
      if (blog.coverImage) {
        deleteFile(blog.coverImage);
      }

      return updatedBlog;
    } catch (error) {
      // DB update fail hua to newly uploaded image delete
      deleteFile(file.path);
      throw error;
    }
  }

  // Image nahi bheji to sirf text fields update
  return this.prisma.blog.update({
    where: { id },
    data: updateBlogDto,
  });
}
async remove(id: number, userId: number) {
  const blog = await this.prisma.blog.findUnique({
    where: { id },
  });

  if (!blog) {
    throw new NotFoundException('Blog not found');
  }

  if (blog.authorId !== userId) {
    throw new ForbiddenException(
      'You can only delete your own blog',
    );
  }

  await this.prisma.blog.delete({
  where: { id },
});

return {
  message: 'Blog deleted successfully',
};
}
}