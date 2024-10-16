// src/user/user.entity.ts

import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  BeforeInsert, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('users') // Ensure this matches your table name
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'userId', unique: true })
  userId: string; // UUID

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;



  @Column({ name: 'mobile_number', unique: true })
mobileNumber: string;


  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  token: string; // Verification or reset token

  @Column({ name: 'isVerified', default: false })
  isVerified: boolean;

  @Column({ type: 'datetime', nullable: true })
  lockUntil: Date | null;

  @Column({ type: 'int', default: 0 })
  failedLoginAttempts: number;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ type: 'datetime', nullable: true })
  resetPasswordExpires: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateUserId() {
    this.userId = uuidv4();
  }
}
