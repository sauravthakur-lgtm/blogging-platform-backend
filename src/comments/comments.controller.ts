import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';

import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Comments')
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('blogs/:blogId/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a comment (JWT required)' })
  @ApiParam({ name: 'blogId', type: Number })
  create(
    @Param('blogId') blogId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: any,
  ) {
    return this.commentsService.create(
      Number(blogId),
      req.user.id,
      createCommentDto,
    );
  }

  @Get('blogs/:blogId/comments')
  @ApiOperation({ summary: 'List comments for a blog (public)' })
  @ApiParam({ name: 'blogId', type: Number })
  findAll(@Param('blogId') blogId: string) {
    return this.commentsService.findAll(Number(blogId));
  }
  @Patch('comments/:id')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Update a comment (JWT required)' })
@ApiParam({ name: 'id', type: Number })
update(
  @Param('id') id: string,
  @Body() body: { content: string },
  @Req() req: any,
) {
  return this.commentsService.update(
    Number(id),
    body.content,
    req.user.id,
  );
}
@Delete('comments/:id')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Delete a comment (JWT required)' })
@ApiParam({ name: 'id', type: Number })
remove(
  @Param('id') id: string,
  @Req() req: any,
) {
  return this.commentsService.remove(
    Number(id),
    req.user.id,
  );
}
}