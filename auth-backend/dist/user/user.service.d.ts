import { User } from './user.entity';
import { Repository } from 'typeorm';
import { EmailService } from '../email/email.service';
export declare class UserService {
    private usersRepository;
    private emailService;
    constructor(usersRepository: Repository<User>, emailService: EmailService);
    register(name: string, email: string, mobileNumber: string, username: string, password: string): Promise<User>;
    verifyEmail(token: string): Promise<void>;
    validateUser(username: string, password: string): Promise<User>;
    requestPasswordReset(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    findOne(username: string): Promise<User | undefined>;
    findAll(): Promise<User[]>;
}
