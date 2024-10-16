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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./user.entity");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const email_service_1 = require("../email/email.service");
const uuid_1 = require("uuid");
let UserService = class UserService {
    constructor(usersRepository, emailService) {
        this.usersRepository = usersRepository;
        this.emailService = emailService;
    }
    async register(name, email, mobileNumber, username, password) {
        const existingUser = await this.usersRepository.findOne({
            where: [
                { username },
                { email },
                { mobileNumber },
            ],
        });
        if (existingUser) {
            throw new common_1.ConflictException('Username, email, or mobile number already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = (0, uuid_1.v4)();
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
            await this.emailService.sendVerificationEmail(savedUser.email, verificationToken);
            return savedUser;
        }
        catch (error) {
            console.error('Error during user registration:', error);
            throw new common_1.InternalServerErrorException('Registration failed');
        }
    }
    async verifyEmail(token) {
        const user = await this.usersRepository.findOne({ where: { token } });
        if (!user) {
            throw new common_1.NotFoundException('Invalid or expired verification token');
        }
        user.isVerified = true;
        user.token = null;
        user.lockUntil = null;
        user.failedLoginAttempts = 0;
        await this.usersRepository.save(user);
    }
    async validateUser(username, password) {
        const user = await this.usersRepository.findOne({ where: { username } });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isVerified) {
            throw new common_1.UnauthorizedException('Email not verified');
        }
        if (user.lockUntil && user.lockUntil > new Date()) {
            const lockDuration = Math.ceil((user.lockUntil.getTime() - new Date().getTime()) / 1000);
            throw new common_1.UnauthorizedException(`Account locked. Try again in ${lockDuration} seconds.`);
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            user.failedLoginAttempts += 1;
            if (user.failedLoginAttempts >= 5) {
                user.lockUntil = new Date(Date.now() + 60 * 1000);
                user.failedLoginAttempts = 0;
            }
            await this.usersRepository.save(user);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        user.failedLoginAttempts = 0;
        user.lockUntil = null;
        await this.usersRepository.save(user);
        return user;
    }
    async requestPasswordReset(email) {
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.NotFoundException('User with given email does not exist');
        }
        const resetToken = (0, uuid_1.v4)();
        const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpires;
        await this.usersRepository.save(user);
        await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    }
    async resetPassword(token, newPassword) {
        const user = await this.usersRepository.findOne({ where: { resetPasswordToken: token } });
        if (!user) {
            throw new common_1.NotFoundException('Invalid or expired password reset token');
        }
        if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
            throw new common_1.NotFoundException('Password reset token has expired');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await this.usersRepository.save(user);
    }
    async findOne(username) {
        return this.usersRepository.findOne({ where: { username } });
    }
    async findAll() {
        return this.usersRepository.find();
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        email_service_1.EmailService])
], UserService);
//# sourceMappingURL=user.service.js.map