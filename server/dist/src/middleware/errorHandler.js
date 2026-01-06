"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = void 0;
const library_1 = require("@prisma/client/runtime/library");
const logger_1 = require("@/utils/logger");
class ValidationError extends Error {
    statusCode = 400;
    isOperational = true;
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends Error {
    statusCode = 401;
    isOperational = true;
    constructor(message = 'Authentication required') {
        super(message);
        this.name = 'AuthenticationError';
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends Error {
    statusCode = 403;
    isOperational = true;
    constructor(message = 'Access denied') {
        super(message);
        this.name = 'AuthorizationError';
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends Error {
    statusCode = 404;
    isOperational = true;
    constructor(message = 'Resource not found') {
        super(message);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends Error {
    statusCode = 409;
    isOperational = true;
    constructor(message = 'Resource conflict') {
        super(message);
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
const handlePrismaError = (error) => {
    switch (error.code) {
        case 'P2002':
            const field = error.meta?.target;
            const fieldName = field?.[0] || 'field';
            const appError = new ConflictError(`${fieldName} already exists`);
            return appError;
        case 'P2025':
            return new NotFoundError('Record not found');
        case 'P2003':
            return new ValidationError('Invalid reference to related record');
        case 'P2014':
            return new ValidationError('Required relation is missing');
        default:
            logger_1.logger.error('Unhandled Prisma error:', { code: error.code, message: error.message });
            const genericError = new Error('Database operation failed');
            genericError.statusCode = 500;
            return genericError;
    }
};
const errorHandler = (error, req, res, next) => {
    let appError = error;
    if (error instanceof library_1.PrismaClientKnownRequestError) {
        appError = handlePrismaError(error);
    }
    else if (error instanceof library_1.PrismaClientValidationError) {
        appError = new ValidationError('Invalid data provided');
    }
    const statusCode = appError.statusCode || 500;
    const message = appError.message || 'Internal server error';
    const isOperational = appError.isOperational || false;
    if (statusCode >= 500) {
        logger_1.logger.error('Server error:', {
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
    }
    else {
        logger_1.logger.warn('Client error:', {
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
    const errorResponse = {
        error: {
            code: error.name || 'UnknownError',
            message,
            timestamp: new Date().toISOString(),
        },
    };
    if (process.env.NODE_ENV === 'development' && error.stack) {
        errorResponse.error.stack = error.stack;
    }
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map