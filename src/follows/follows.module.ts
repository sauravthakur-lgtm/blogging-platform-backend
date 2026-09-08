import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { FollowsController } from './follows.controller';
import { FollowsService } from './follows.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],
  controllers: [FollowsController],
  providers: [FollowsService],
})
export class FollowsModule {}