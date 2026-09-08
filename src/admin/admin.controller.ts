import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check admin access (JWT and ADMIN role required)' })
  adminTest() {
    return {
      message: 'Admin access granted',
    };
  }
  @Get('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
@ApiOperation({ summary: 'List all users (JWT and ADMIN role required)' })
getAllUsers() {
  return this.adminService.getAllUsers();
}
@Patch('users/:id/unblock')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
@ApiOperation({ summary: 'Unblock a user (JWT and ADMIN role required)' })
@ApiParam({ name: 'id', type: Number })
unblockUser(@Param('id', ParseIntPipe) id: number) {
  return this.adminService.unblockUser(id);
}
@Delete('users/:id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
@ApiOperation({ summary: 'Delete a user (JWT and ADMIN role required)' })
@ApiParam({ name: 'id', type: Number })
deleteUser(@Param('id', ParseIntPipe) id: number) {
  return this.adminService.deleteUser(id);
}
@Delete('blogs/:id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
@ApiOperation({ summary: 'Delete a blog (JWT and ADMIN role required)' })
@ApiParam({ name: 'id', type: Number })
deleteBlog(@Param('id', ParseIntPipe) id: number) {
  return this.adminService.deleteBlog(id);
}           
}