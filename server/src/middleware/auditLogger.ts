import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth';
import { prisma } from '@/server';
import { logger } from '@/utils/logger';

export const auditLogger = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Store original end function
  const originalEnd = res.end;
  
  // Override res.end to capture response
  res.end = function(chunk?: any, encoding?: any): any {
    // Only log successful operations (2xx status codes)
    if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
      // Async audit logging (don't block response)
      setImmediate(async () => {
        try {
          await prisma.auditLog.create({
            data: {
              userId: req.user!.id,
              userType: req.user!.type.toUpperCase() as 'STUDENT' | 'TEACHER',
              action: `${req.method} ${req.route?.path || req.path}`,
              resource: extractResourceFromPath(req.path),
              details: {
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
                userAgent: req.get('User-Agent'),
                params: req.params,
                query: req.query,
                // Don't log sensitive data like passwords
                body: sanitizeBody(req.body),
              },
              ipAddress: req.ip,
              userAgent: req.get('User-Agent'),
            },
          });
        } catch (error) {
          logger.error('Failed to create audit log:', error);
        }
      });
    }

    // Call original end function
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

function extractResourceFromPath(path: string): string {
  // Extract resource type from API path
  const pathParts = path.split('/').filter(part => part);
  
  if (pathParts.length >= 2 && pathParts[0] === 'api') {
    return pathParts[1]; // e.g., 'students', 'courses', 'assignments'
  }
  
  return 'unknown';
}

function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sanitized = { ...body };
  
  // Remove sensitive fields
  const sensitiveFields = [
    'password',
    'passwordHash',
    'token',
    'refreshToken',
    'secret',
    'key',
  ];

  sensitiveFields.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
}