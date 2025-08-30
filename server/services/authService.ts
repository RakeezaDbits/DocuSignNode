
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { storage } from '../storage';
import { emailService } from './emailService';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin?: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

class AuthService {
  private jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  private saltRounds = 12;

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  generateToken(user: AuthUser): string {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        isAdmin: user.isAdmin || false
      },
      this.jwtSecret,
      { expiresIn: '7d' }
    );
  }

  verifyToken(token: string): AuthUser | null {
    try {
      return jwt.verify(token, this.jwtSecret) as AuthUser;
    } catch {
      return null;
    }
  }

  generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async signup(data: SignupData): Promise<{ user: AuthUser; token: string }> {
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(data.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(data.password);

    // Create user
    const user = await storage.createUser({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    // Send welcome email
    await emailService.sendWelcomeEmail(user);

    // Generate token
    const token = this.generateToken(user);

    return { user, token };
  }

  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
    // Get user by email
    const user = await storage.getUserByEmail(credentials.email);
    if (!user || !user.password) {
      throw new Error('Invalid email or password');
    }

    // Check password
    const isValidPassword = await this.comparePassword(credentials.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = this.generateToken(user);

    return { user, token };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await storage.getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return;
    }

    // Generate reset token
    const resetToken = this.generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token
    await storage.savePasswordResetToken(user.id, resetToken, resetTokenExpiry);

    // Send reset email
    await emailService.sendPasswordResetEmail(user, resetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Verify reset token
    const resetData = await storage.getPasswordResetToken(token);
    if (!resetData || resetData.expiresAt < new Date()) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update password
    await storage.updateUserPassword(resetData.userId, hashedPassword);

    // Delete reset token
    await storage.deletePasswordResetToken(token);

    // Send confirmation email
    const user = await storage.getUser(resetData.userId);
    if (user) {
      await emailService.sendPasswordChangedEmail(user);
    }
  }
}

export const authService = new AuthService();
