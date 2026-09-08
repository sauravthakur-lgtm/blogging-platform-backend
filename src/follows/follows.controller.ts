import {
  Controller,
  Post,
  Delete,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Follows')
@Controller()
export class FollowsController {
  constructor(
    private readonly followsService: FollowsService,
  ) {}

  @Post('users/:id/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Follow a user (JWT required)' })
  @ApiParam({ name: 'id', type: Number })
  follow(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.followsService.follow(
      Number(id),
      req.user.id,
    );
  }
  @Delete('users/:id/follow')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Unfollow a user (JWT required)' })
@ApiParam({ name: 'id', type: Number })
unfollow(
  @Param('id') id: string,
  @Req() req: any,
) {
  return this.followsService.unfollow(
    Number(id),
    req.user.id,
  );
}
}