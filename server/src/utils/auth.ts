import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '@/middleware/auth';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateTokens = (payload: Omit<JWTPayload, 'iat' | 'exp'>): TokenPair => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  
  if (!jwtSecret || !jwtRefreshSecret) {
    throw new Error('JWT secrets not configured');
  }

  const accessToken = jwt.sign(payload, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    issuer: 'student-lms',
    audience: 'student-lms-users',
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(
    { id: payload.id, type: payload.type },
    jwtRefreshSecret,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      issuer: 'student-lms',
      audience: 'student-lms-users',
    } as jwt.SignOptions
  );

  return { accessToken, refreshToken };
};

export const verifyRefreshToken = (token: string): { id: string; type: 'student' | 'teacher' } => {
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  
  if (!jwtRefreshSecret) {
    throw new Error('JWT refresh secret not configured');
  }

  return jwt.verify(token, jwtRefreshSecret) as { id: string; type: 'student' | 'teacher' };
};

export const generateSecurePassword = (): string => {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
};