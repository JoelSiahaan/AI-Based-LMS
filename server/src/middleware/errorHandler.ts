import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';
import { logger } from '@/utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class ValidationError extends Error {
  statusCode = 400;
  isOperational = true;

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  statusCode = 401;
  isOperational = true;

  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  statusCode = 403;
  isOperational = true;

  constructor(message: string = 'Access denied') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  statusCode = 404;
  isOperational = true;

  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  statusCode = 409;
  isOperational = true;

  constructor(message: string = 'Resource conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}

const handlePrismaError = (error: PrismaClientKnownRequestError): AppError => {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = error.meta?.target as string[] | undefined;
      const fieldName = field?.[0] || 'field';
      const appError = new ConflictError(`${fieldName} already exists`);
      return appError;
    
    case 'P2025':
      // Record not found
      return new NotFoundError('Record not found');
    
    case 'P2003':
      // Foreign key constraint violation
      return new ValidationError('Invalid reference to related record');
    
    case 'P2014':
      // Required relation violation
      return new ValidationError('Required relation is missing');
    
    default:
      logger.error('Unhandled Prisma error:', { code: error.code, message: error.message });
      const genericError = new Error('Database operation failed') as AppError;
      genericError.statusCode = 500;
      return genericError;
  }
};

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let appError = error as AppError;

  // Handle Prisma errors
  if (error instanceof PrismaClientKnownRequestError) {
    appError = handlePrismaError(error);
  } else if (error instanceof PrismaClientValidationError) {
    appError = new ValidationError('Invalid data provided');
  }

  // Set default error properties
  const statusCode = appError.statusCode || 500;
  const message = appError.message || 'Internal server error';
  const isOperational = appError.isOperational || false;

  // Log error
  if (statusCode >= 500) {
    logger.error('Server error:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      request: {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      },
    });
  } else {
    logger.warn('Client error:', {
      error: {
        name: error.name,
        message: error.message,
      },
      request: {
        method: req.method,
        url: req.url,
        ip: req.ip,
      },
    });
  }

  // Send error response
  const errorResponse: any = {
    error: {
      code: error.name || 'UnknownError',
      message,
      timestamp: new Date().toISOString(),
    },
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development' && error.stack) {
    errorResponse.error.stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};