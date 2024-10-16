// src/user/user.service.ts

import { 
  Injectable, 
  ConflictException, 
  NotFoundException, 
  UnauthorizedException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../email/email.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private emailService: EmailService,
  ) {}

  // Register a new user
  async register(
    name: string,
    email: string,
    mobileNumber: string,
    username: string,
    password: string,
  ): Promise<User> {
    // Check if the username, email, or mobileNumber already exists
    const existingUser = await this.usersRepository.findOne({
      where: [
        { username }, 
        { email }, 
        { mobileNumber },
      ],
    });
    if (existingUser) {
      throw new ConflictException('Username, email, or mobile number already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token
    const verificationToken = uuidv4();

    // Create and save the new user
    const user = this.usersRepository.create({
      name,
      email,
      mobileNumber,
      username,
      password: hashedPassword,
      token: verificationToken,
      isVerified: false,
    });

    try {
      const savedUser = await this.usersRepository.save(user);
      // Send verification email
      await this.emailService.sendVerificationEmail(savedUser.email, verificationToken);
      return savedUser;
    } catch (error) {
      console.error('Error during user registration:', error);
      throw new InternalServerErrorException('Registration failed');
    }
  }

  // Verify email
  async verifyEmail(token: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { token } });
    if (!user) {
      throw new NotFoundException('Invalid or expired verification token');
    }

    user.isVerified = true;
    user.token = null; // Clear the token
    user.lockUntil = null; // Reset lockUntil if any
    user.failedLoginAttempts = 0; // Reset failed login attempts
    await this.usersRepository.save(user);
  }

  // Login logic with rate-limiting
  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    // Check if user is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const lockDuration = Math.ceil((user.lockUntil.getTime() - new Date().getTime()) / 1000);
      throw new UnauthorizedException(`Account locked. Try again in ${lockDuration} seconds.`);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) { // Threshold for lockout
        user.lockUntil = new Date(Date.now() + 60 * 1000); // Lock for 1 minute
        user.failedLoginAttempts = 0; // Reset attempts after lockout
      }
      await this.usersRepository.save(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed login attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await this.usersRepository.save(user);

    return user;
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User with given email does not exist');
    }

    const resetToken = uuidv4();
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await this.usersRepository.save(user);

    // Send password reset email
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { resetPasswordToken: token } });
    if (!user) {
      throw new NotFoundException('Invalid or expired password reset token');
    }

    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      throw new NotFoundException('Password reset token has expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await this.usersRepository.save(user);
  }

  // Find user by username
  async findOne(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { username } });
  }

  // List all users
  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
}
