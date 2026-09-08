import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
   Query,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { QueryBlogDto } from './dto/query-blog.dto';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { ensureUploadDir, getUploadDir } from './utils/upload.utils';
@ApiTags('Blogs')
@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

@Post()
@UseGuards(JwtAuthGuard)
@UseInterceptors(
  FileInterceptor('coverImage', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        ensureUploadDir();
        cb(null, getUploadDir());
      },

      filename: (req, file, cb) => {
        const uniqueName =
          Date.now() + '-' + Math.round(Math.random() * 1e9);

        cb(null, uniqueName + '-' + file.originalname);
      },
    }),

    limits: {
      fileSize: 5 * 1024 * 1024,
    },
fileFilter: (req, file, cb) => {
  console.log('File name:', file.originalname);
  console.log('File type:', file.mimetype);

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/octet-stream',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Only jpg, jpeg, png and webp images are allowed'),
      false,
    );
  }
},
  }),
)
@ApiOperation({ summary: 'Create a new blog' })
@ApiBearerAuth()
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    required: ['title', 'content'],
    properties: {
      title: { type: 'string', example: 'My first blog post' },
      content: { type: 'string', example: 'Blog post content.' },
      coverImage: {
        type: 'string',
        format: 'binary',
        description: 'Optional JPG, JPEG, PNG, or WEBP image; maximum 5 MB.',
      },
    },
  },
})
@ApiResponse({ status: 201, description: 'Blog created successfully.' })
create(
  @Body() createBlogDto: CreateBlogDto,
  @UploadedFile() file: Express.Multer.File,
  @Req() req: any,
) {
  return this.blogsService.create(
    createBlogDto,
    req.user.id,
    file,
  );
}
@Get()
@ApiOperation({ summary: 'List blogs (public)' })
@ApiResponse({ status: 200, description: 'Paginated blog list.' })
findAll(@Query() query: QueryBlogDto) {
  return this.blogsService.findAll(query);
}
@Patch(':id/publish')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Publish a blog (JWT required)' })
@ApiParam({ name: 'id', type: Number })
publish(@Param('id') id: string, @Req() req: any) {
  return this.blogsService.publish(Number(id), req.user.id);
}
@Patch(':id')
@UseGuards(JwtAuthGuard)
@UseInterceptors(
  FileInterceptor('coverImage', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        ensureUploadDir();
        cb(null, getUploadDir());
      },

      filename: (req, file, cb) => {
        const uniqueName =
          Date.now() + '-' + Math.round(Math.random() * 1e9);

        cb(null, uniqueName + '-' + file.originalname);
      },
    }),

    limits: {
      fileSize: 5 * 1024 * 1024,
    },

    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/octet-stream',
      ];

      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error(
            'Only jpg, jpeg, png and webp images are allowed',
          ),
          false,
        );
      }
    },
  }),
)
@ApiBearerAuth()
@ApiOperation({ summary: 'Update a blog (JWT required)' })
@ApiParam({ name: 'id', type: Number })
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      title: { type: 'string', example: 'Updated title' },
      content: { type: 'string', example: 'Updated content.' },
      coverImage: {
        type: 'string',
        format: 'binary',
        description: 'Optional JPG, JPEG, PNG, or WEBP image; maximum 5 MB.',
      },
    },
  },
})
update(
  @Param('id') id: string,
  @Body() updateBlogDto: UpdateBlogDto,
  @UploadedFile() file: Express.Multer.File,
  @Req() req: any,
) {
  return this.blogsService.update(
    +id,
    updateBlogDto,
    req.user.id,
    file,
  );
}
@Delete(':id')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Delete a blog (JWT required)' })
@ApiParam({ name: 'id', type: Number })
remove(
  @Param('id') id: string,
  @Req() req: any,
) {
  return this.blogsService.remove(
    Number(id),
    req.user.id,
  );
} 
}