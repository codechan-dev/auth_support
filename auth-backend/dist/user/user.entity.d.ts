export declare class User {
    id: number;
    userId: string;
    email: string;
    name: string;
    mobileNumber: string;
    username: string;
    password: string;
    token: string;
    isVerified: boolean;
    lockUntil: Date | null;
    failedLoginAttempts: number;
    resetPasswordToken: string;
    resetPasswordExpires: Date | null;
    createdAt: Date;
    updatedAt: Date;
    generateUserId(): void;
}
