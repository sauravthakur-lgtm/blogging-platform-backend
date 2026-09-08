import {
  Controller,
  Post,
  Delete,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Likes')
@Controller()
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post('blogs/:blogId/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like a blog (JWT required)' })
  @ApiParam({ name: 'blogId', type: Number })
  like(
    @Param('blogId') blogId: string,
    @Req() req: any,
  ) {
    return this.likesService.like(
      Number(blogId),
      req.user.id,
    );
  }
  @Delete('blogs/:blogId/like')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Unlike a blog (JWT required)' })
@ApiParam({ name: 'blogId', type: Number })
unlike(
  @Param('blogId') blogId: string,
  @Req() req: any,
) {
  return this.likesService.unlike(
    Number(blogId),
    req.user.id,
  );
}
}