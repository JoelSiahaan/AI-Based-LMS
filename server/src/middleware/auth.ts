import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '@/server';
import { AuthenticationError, AuthorizationError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    type: 'student' | 'teacher';
    studentId?: string;
    teacherId?: string;
  };
}

export interface JWTPayload {
  id: string;
  email: string;
  type: 'student' | 'teacher';
  studentId?: string;
  teacherId?: string;
  iat?: number;
  exp?: number;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET not configured');
      throw new Error('Authentication configuration error');
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    // Verify user still exists and is active
    let user;
    if (decoded.type === 'student') {
      user = await prisma.student.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          studentId: true,
          isActive: true,
          lastLoginAt: true,
        },
      });
      
      if (!user || !user.isActive) {
        throw new AuthenticationError('Invalid or inactive user');
      }
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
      
      if (!user || !user.isActive) {
        throw new AuthenticationError('Invalid or inactive user');
      }
    } else {
      throw new AuthenticationError('Invalid user type');
    }

    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      type: decoded.type,
      studentId: decoded.type === 'student' ? user.studentId : undefined,
      teacherId: decoded.type === 'teacher' ? user.teacherId : undefined,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError('Token expired'));
    } else {
      next(error);
    }
  }
};

// Middleware to ensure user is a student
export const requireStudent = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.type !== 'student') {
    next(new AuthorizationError('Student access required'));
    return;
  }
  next();
};

// Middleware to ensure user is a teacher
export const requireTeacher = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.type !== 'teacher') {
    next(new AuthorizationError('Teacher access required'));
    return;
  }
  next();
};

// Middleware to ensure user can access a specific course
export const requireCourseAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const courseId = req.params.courseId || req.body.courseId;
    
    if (!courseId) {
      next(new AuthenticationError('Course ID required'));
      return;
    }

    if (!req.user) {
      next(new AuthenticationError('Authentication required'));
      return;
    }

    if (req.user.type === 'student') {
      // Check if student is enrolled in the course
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: req.user.id,
            courseId: courseId,
          },
        },
      });

      if (!enrollment || !enrollment.isActive) {
        next(new AuthorizationError('Not enrolled in this course'));
        return;
      }
    } else if (req.user.type === 'teacher') {
      // Check if teacher owns the course
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { teacherId: true },
      });

      if (!course || course.teacherId !== req.user.id) {
        next(new AuthorizationError('Not authorized for this course'));
        return;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};