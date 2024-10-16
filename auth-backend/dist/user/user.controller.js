"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const user_service_1 = require("./user.service");
const jwt_1 = require("@nestjs/jwt");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const register_dto_1 = require("./dto/register.dto");
const login_dto_1 = require("./dto/login.dto");
const verify_email_dto_1 = require("./dto/verify-email.dto");
const password_reset_request_dto_1 = require("./dto/password-reset-request.dto");
const password_reset_dto_1 = require("./dto/password-reset.dto");
const common_2 = require("@nestjs/common");
let UserController = class UserController {
    constructor(userService, jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }
    async register(registerDto) {
        try {
            const user = await this.userService.register(registerDto.name, registerDto.email, registerDto.mobileNumber, registerDto.username, registerDto.password);
            return { message: 'User registered successfully. Please verify your email.' };
        }
        catch (error) {
            if (error instanceof common_2.ConflictException) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.CONFLICT);
            }
            console.error('Registration Error:', error);
            throw new common_1.HttpException('Internal server error.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async login(loginDto) {
        try {
            const user = await this.userService.validateUser(loginDto.username, loginDto.password);
            const payload = { username: user.username, sub: user.id };
            const token = this.jwtService.sign(payload);
            return { access_token: token };
        }
        catch (error) {
            if (error instanceof common_2.UnauthorizedException) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.UNAUTHORIZED);
            }
            console.error('Login Error:', error);
            throw new common_1.HttpException('Internal server error.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifyEmail(verifyEmailDto) {
        try {
            await this.userService.verifyEmail(verifyEmailDto.token);
            return { message: 'Email verified successfully.' };
        }
        catch (error) {
            if (error instanceof common_2.NotFoundException) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.NOT_FOUND);
            }
            console.error('Email Verification Error:', error);
            throw new common_1.HttpException('Email verification failed', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async requestPasswordReset(passwordResetRequestDto) {
        try {
            await this.userService.requestPasswordReset(passwordResetRequestDto.email);
            return { message: 'Password reset email sent.' };
        }
        catch (error) {
            if (error instanceof common_2.NotFoundException) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.NOT_FOUND);
            }
            console.error('Password Reset Request Error:', error);
            throw new common_1.HttpException('Password reset request failed', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async resetPassword(passwordResetDto) {
        try {
            await this.userService.resetPassword(passwordResetDto.token, passwordResetDto.newPassword);
            return { message: 'Password reset successfully.' };
        }
        catch (error) {
            if (error instanceof common_2.NotFoundException) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.NOT_FOUND);
            }
            console.error('Password Reset Error:', error);
            throw new common_1.HttpException('Password reset failed', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findAll(req) {
        return this.userService.findAll();
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User registered successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Username, email, or mobile number already exists.' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "register", null);
__decorate([
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Login a user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User logged in successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials.' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too many requests. Please try again later.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('verify-email'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify user email' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email verified successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Invalid or expired verification token.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_email_dto_1.VerifyEmailDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)('request-password-reset'),
    (0, swagger_1.ApiOperation)({ summary: 'Request password reset' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset email sent.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User with given email does not exist.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [password_reset_request_dto_1.PasswordResetRequestDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "requestPasswordReset", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Reset password' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Invalid or expired password reset token.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [password_reset_dto_1.PasswordResetDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of users (protected)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of users.' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAll", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [user_service_1.UserService, jwt_1.JwtService])
], UserController);
//# sourceMappingURL=user.controller.js.map