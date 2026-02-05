/**
 * User Service - Business logic for user management
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { IUser, ISession, UserRole } from '../types';
import { database } from '../config/database';
import { AppConfig } from '../config/app.config';

export class UserService {
  /**
   * Create a new user
   */
  async createUser(
    email: string,
    password: string,
    tenantId: string,
    role: UserRole = UserRole.USER
  ): Promise<Omit<IUser, 'passwordHash'>> {
    // Check if user already exists
    const existing = await database.getUserByEmail(email);
    if (existing) {
      throw new Error('User with this email already exists');
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, AppConfig.security.bcryptRounds);
    
    // Create user
    const user: IUser = {
      id: uuidv4(),
      email,
      passwordHash,
      tenantId,
      role,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true,
    };
    
    await database.createUser(user);
    
    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  /**
   * Authenticate user and create session
   */
  async authenticate(email: string, password: string): Promise<{ user: Omit<IUser, 'passwordHash'>; token: string }> {
    const user = await database.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    if (!user.isActive) {
      throw new Error('User account is inactive');
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }
    
    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: user.tenantId,
        role: user.role,
      },
      AppConfig.security.jwtSecret as jwt.Secret
    );
    
    // Create session
    const session: ISession = {
      id: uuidv4(),
      userId: user.id,
      tenantId: user.tenantId,
      token,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      createdAt: Date.now(),
    };
    
    await database.createSession(session);
    
    const { passwordHash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }
  
  /**
   * Verify token and get session
   */
  async verifyToken(token: string): Promise<ISession | null> {
    try {
      // Verify JWT
      jwt.verify(token, AppConfig.security.jwtSecret);
      
      // Get session from database
      const session = await database.getSessionByToken(token);
      return session;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<Omit<IUser, 'passwordHash'> | null> {
    const user = await database.getUserById(userId);
    if (!user) return null;
    
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  /**
   * Update user
   */
  async updateUser(userId: string, updates: Partial<Omit<IUser, 'id' | 'passwordHash'>>): Promise<Omit<IUser, 'passwordHash'> | null> {
    const updated = await database.updateUser(userId, updates);
    if (!updated) return null;
    
    const { passwordHash: _, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }
  
  /**
   * Change password
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
    const user = await database.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid old password');
    }
    
    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, AppConfig.security.bcryptRounds);
    
    // Update
    const updated = await database.updateUser(userId, { passwordHash });
    return updated !== null;
  }
  
  /**
   * Deactivate user
   */
  async deactivateUser(userId: string): Promise<boolean> {
    const updated = await database.updateUser(userId, { isActive: false });
    return updated !== null;
  }
  
  /**
   * Logout (delete session)
   */
  async logout(sessionId: string): Promise<boolean> {
    return await database.deleteSession(sessionId);
  }
}

export const userService = new UserService();
