import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BlogsModule } from './blogs/blogs.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { FollowsModule } from './follows/follows.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { SchedulerService } from './scheduler/scheduler.service';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ScheduleModule.forRoot(),

    PrismaModule,
    AuthModule,
    BlogsModule,
    CommentsModule,
    LikesModule,
    FollowsModule,
    UsersModule,
    AdminModule,
  ],

  controllers: [AppController],
providers: [AppService, SchedulerService],
})
export class AppModule {}