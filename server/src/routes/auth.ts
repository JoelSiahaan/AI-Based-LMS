import { Router, Request, Response, NextFunction } from 'express';
import { prisma, redisClient } from '@/server';
import { hashPassword, comparePassword, generateTokens, verifyRefreshToken } from '@/utils/auth';
import { validate } from '@/utils/validation';
import { loginSchema, registerStudentSchema, refreshTokenSchema } from '@/utils/validation';
import { AuthenticationError, ValidationError, ConflictError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

const router = Router();

// Student registration
router.post('/register/student', validate(registerStudentSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName, studentId } = req.body;

    // Check if student already exists
    const existingStudent = await prisma.student.findFirst({
      where: {
        OR: [
          { email },
          { studentId },
        ],
      },
    });

    if (existingStudent) {
      if (existingStudent.email === email) {
        throw new ConflictError('Email already registered');
      }
      if (existingStudent.studentId === studentId) {
        throw new ConflictError('Student ID already exists');
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create student
    const student = await prisma.student.create({
      data: {
        email,
        firstName,
        lastName,
        studentId,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        studentId: true,
        createdAt: true,
      },
    });

    // Create default notification preferences
    await prisma.notificationPreference.create({
      data: {
        studentId: student.id,
      },
    });

    logger.info('Student registered successfully', { studentId: student.studentId, email: student.email });

    res.status(201).json({
      message: 'Student registered successfully',
      student,
    });
  } catch (error) {
    next(error);
  }
});

// Student login
router.post('/login', validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Find student
    const student = await prisma.student.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        studentId: true,
        passwordHash: true,
        isActive: true,
      },
    });

    if (!student || !student.isActive) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await comparePassword(password, student.passwordHash);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Generate tokens
    const tokens = generateTokens({
      id: student.id,
      email: student.email,
      type: 'student',
      studentId: student.studentId,
    });

    // Store refresh token in Redis (with expiration)
    const refreshTokenKey = `refresh_token:${student.id}`;
    await redisClient.setEx(refreshTokenKey, 7 * 24 * 60 * 60, tokens.refreshToken); // 7 days

    // Update last login
    await prisma.student.update({
      where: { id: student.id },
      data: { lastLoginAt: new Date() },
    });

    logger.info('Student logged in successfully', { studentId: student.studentId, email: student.email });

    res.json({
      message: 'Login successful',
      user: {
        id: student.id,
        email: student.email,
        firstName: student.firstName,
        lastName: student.lastName,
        studentId: student.studentId,
        type: 'student',
      },
      tokens,
    });
  } catch (error) {
    next(error);
  }
});

// Refresh token
router.post('/refresh', validate(refreshTokenSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if refresh token exists in Redis
    const refreshTokenKey = `refresh_token:${decoded.id}`;
    const storedToken = await redisClient.get(refreshTokenKey);

    if (!storedToken || storedToken !== refreshToken) {
      throw new AuthenticationError('Invalid refresh token');
    }

    // Get user data
    let user;
    if (decoded.type === 'student') {
      user = await prisma.student.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          studentId: true,
          isActive: true,
        },
      });
    } else if (decoded.type === 'teacher') {
      user = await prisma.teacher.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          teacherId: true,
          isActive: true,
        },
      });
    }

    if (!user || !user.isActive) {
      // Remove invalid refresh token
      await redisClient.del(refreshTokenKey);
      throw new AuthenticationError('Invalid user');
    }

    // Generate new tokens
    const tokens = generateTokens({
      id: decoded.id,
      email: user.email,
      type: decoded.type,
      studentId: decoded.type === 'student' ? (user as any).studentId : undefined,
      teacherId: decoded.type === 'teacher' ? (user as any).teacherId : undefined,
    });

    // Update refresh token in Redis
    await redisClient.setEx(refreshTokenKey, 7 * 24 * 60 * 60, tokens.refreshToken);

    logger.info('Token refreshed successfully', { userId: decoded.id, type: decoded.type });

    res.json({
      message: 'Token refreshed successfully',
      tokens,
    });
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        // We could implement token blacklisting here if needed
        // For now, we'll just remove the refresh token from Redis
        
        // Note: In a production system, you might want to maintain a blacklist
        // of revoked access tokens until they expire naturally
        
        logger.info('User logged out');
      } catch (error) {
        // Token might be invalid, but that's okay for logout
      }
    }

    res.json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Logout from all devices
router.post('/logout-all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const jwtSecret = process.env.JWT_SECRET;
        if (jwtSecret) {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, jwtSecret) as { id: string };
          
          // Remove refresh token from Redis
          const refreshTokenKey = `refresh_token:${decoded.id}`;
          await redisClient.del(refreshTokenKey);
          
          logger.info('User logged out from all devices', { userId: decoded.id });
        }
      } catch (error) {
        // Token might be invalid, but that's okay for logout
      }
    }

    res.json({
      message: 'Logged out from all devices successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Check authentication status
router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      throw new Error('JWT secret not configured');
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, jwtSecret) as { id: string; type: string };

    // Get user data
    let user;
    if (decoded.type === 'student') {
      user = await prisma.student.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          studentId: true,
          isActive: true,
          lastLoginAt: true,
        },
      });
    } else if (decoded.type === 'teacher') {
      user = await prisma.teacher.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          teacherId: true,
          isActive: true,
        },
      });
    }

    if (!user || !user.isActive) {
      throw new AuthenticationError('Invalid user');
    }

    res.json({
      user: {
        ...user,
        type: decoded.type,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;