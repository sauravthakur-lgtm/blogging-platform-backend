import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../generated/prisma/enums';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LogoutDto } from './dto/logout.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a user (public)' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
@Post('login')
@ApiOperation({ summary: 'Log in and receive JWT tokens (public)' })
@ApiResponse({ status: 201, description: 'Login successful.' })
login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}
@Get('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Get the authenticated user profile (JWT required)' })
getProfile(@Req() req: any) {
  return {
    message: 'Authenticated successfully',
    user: req.user,
  };
}
@Get('admin-test')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
@ApiOperation({ summary: 'Check admin access (JWT and ADMIN role required)' })
adminTest() {
  return {
    message: 'Admin access granted',
  };
}
@Post('forgot-password')
@ApiOperation({ summary: 'Request a password reset (public)' })
forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
  return this.authService.forgotPassword(
    forgotPasswordDto.email,
  );
}
@Post('reset-password')
@ApiOperation({ summary: 'Reset a password using a reset token (public)' })
resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
  return this.authService.resetPassword(
    resetPasswordDto.token,
    resetPasswordDto.newPassword,
  );
}
@Post('refresh')
@ApiOperation({ summary: 'Refresh an access token (public)' })
refreshAccessToken(
  @Body() refreshTokenDto: RefreshTokenDto,
) {
  return this.authService.refreshAccessToken(
    refreshTokenDto.refreshToken,
  );
}
@Post('logout')
@ApiOperation({ summary: 'Log out using a refresh token (public)' })
logout(@Body() logoutDto: LogoutDto) {
  return this.authService.logout(logoutDto.refreshToken);
}
}