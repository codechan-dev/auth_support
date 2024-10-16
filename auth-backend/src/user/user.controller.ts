// src/user/user.controller.ts

import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  UseGuards, 
  Request, 
  HttpException, 
  HttpStatus 
} from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { PasswordResetRequestDto } from './dto/password-reset-request.dto';
import { PasswordResetDto } from './dto/password-reset.dto';
import { UnauthorizedException, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Any } from 'typeorm';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService, private jwtService: JwtService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 409, description: 'Username, email, or mobile number already exists.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async register(@Body() registerDto: RegisterDto) {
    try {
      const user = await this.userService.register(
        registerDto.name,
        registerDto.email,
        registerDto.mobileNumber,
        registerDto.username,
        registerDto.password,
      );
      return { message: 'User registered successfully. Please verify your email.' };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      console.error('Registration Error:', error);
      throw new HttpException('Internal server error.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(ThrottlerGuard) // Apply ThrottlerGuard
 
  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @ApiResponse({ status: 429, description: 'Too many requests. Please try again later.' })
  async login(@Body() loginDto: LoginDto) {
    try {
      const user = await this.userService.validateUser(loginDto.username, loginDto.password);
      const payload = { username: user.username, sub: user.id };
      const token = this.jwtService.sign(payload);
      return { access_token: token };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
      }
      console.error('Login Error:', error);
      throw new HttpException('Internal server error.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify user email' })
  @ApiResponse({ status: 200, description: 'Email verified successfully.' })
  @ApiResponse({ status: 404, description: 'Invalid or expired verification token.' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    try {
      await this.userService.verifyEmail(verifyEmailDto.token);
      return { message: 'Email verified successfully.' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      console.error('Email Verification Error:', error);
      throw new HttpException('Email verification failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('request-password-reset')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent.' })
  @ApiResponse({ status: 404, description: 'User with given email does not exist.' })
  async requestPasswordReset(@Body() passwordResetRequestDto: PasswordResetRequestDto) {
    try {
      await this.userService.requestPasswordReset(passwordResetRequestDto.email);
      return { message: 'Password reset email sent.' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      console.error('Password Reset Request Error:', error);
      throw new HttpException('Password reset request failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully.' })
  @ApiResponse({ status: 404, description: 'Invalid or expired password reset token.' })
  async resetPassword(@Body() passwordResetDto: PasswordResetDto) {
    try {
      await this.userService.resetPassword(passwordResetDto.token, passwordResetDto.newPassword);
      return { message: 'Password reset successfully.' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      console.error('Password Reset Error:', error);
      throw new HttpException('Password reset failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOperation({ summary: 'Get list of users (protected)' })
  @ApiResponse({ status: 200, description: 'List of users.' })
  async findAll(@Request() req) {
    return this.userService.findAll();
  }
}
