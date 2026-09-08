

import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

import {
  ensureProfileUploadDir,
  getProfileUploadDir,
} from './utils/upload.utils';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
@ApiTags('Users / Profile')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the authenticated user profile (JWT required)' })
  getProfile(@Req() req: any) {
    return this.usersService.getProfile(req.user.id);
  }
  @Patch('profile')
@UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the authenticated user profile (JWT required)' })
updateProfile(
  @Req() req: any,
  @Body() updateProfileDto: UpdateProfileDto,
) {
  return this.usersService.updateProfile(
    req.user.id,
    updateProfileDto,
  );
}

@Patch('profile/image')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Upload a profile image (JWT required)' })
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      profileImage: {
        type: 'string',
        format: 'binary',
        description: 'JPG, JPEG, PNG, or WEBP image; maximum 5 MB.',
      },
    },
  },
})
@UseInterceptors(
  FileInterceptor('profileImage', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        ensureProfileUploadDir();
        cb(null, getProfileUploadDir());
      },

      filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();

        const filename =
          `${Date.now()}-${Math.round(Math.random() * 1e9)}` +
          extension;

        cb(null, filename);
      },
    }),

    limits: {
      fileSize: 5 * 1024 * 1024,
    },

  fileFilter: (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    return cb(
      new BadRequestException(
        'Only jpg, jpeg, png and webp images are allowed',
      ),
      false,
    );
  }

  cb(null, true);
},
  }),
)
updateProfileImage(
  @Req() req: any,
  @UploadedFile() file: any,
) {
  return this.usersService.updateProfileImage(
    req.user.id,
    file,
  );
}
}