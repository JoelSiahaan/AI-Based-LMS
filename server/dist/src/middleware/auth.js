"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireCourseAccess = exports.requireTeacher = exports.requireStudent = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const server_1 = require("@/server");
const errorHandler_1 = require("@/middleware/errorHandler");
const logger_1 = require("@/utils/logger");
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errorHandler_1.AuthenticationError('No token provided');
        }
        const token = authHeader.substring(7);
        if (!token) {
            throw new errorHandler_1.AuthenticationError('No token provided');
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            logger_1.logger.error('JWT_SECRET not configured');
            throw new Error('Authentication configuration error');
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        let user;
        if (decoded.type === 'student') {
            user = await server_1.prisma.student.findUnique({
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
                throw new errorHandler_1.AuthenticationError('Invalid or inactive user');
            }
        }
        else if (decoded.type === 'teacher') {
            user = await server_1.prisma.teacher.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    email: true,
                    teacherId: true,
                    isActive: true,
                },
            });
            if (!user || !user.isActive) {
                throw new errorHandler_1.AuthenticationError('Invalid or inactive user');
            }
        }
        else {
            throw new errorHandler_1.AuthenticationError('Invalid user type');
        }
        req.user = {
            id: decoded.id,
            email: decoded.email,
            type: decoded.type,
            studentId: decoded.type === 'student' ? user.studentId : undefined,
            teacherId: decoded.type === 'teacher' ? user.teacherId : undefined,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new errorHandler_1.AuthenticationError('Invalid token'));
        }
        else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            next(new errorHandler_1.AuthenticationError('Token expired'));
        }
        else {
            next(error);
        }
    }
};
exports.authMiddleware = authMiddleware;
const requireStudent = (req, res, next) => {
    if (!req.user || req.user.type !== 'student') {
        next(new errorHandler_1.AuthorizationError('Student access required'));
        return;
    }
    next();
};
exports.requireStudent = requireStudent;
const requireTeacher = (req, res, next) => {
    if (!req.user || req.user.type !== 'teacher') {
        next(new errorHandler_1.AuthorizationError('Teacher access required'));
        return;
    }
    next();
};
exports.requireTeacher = requireTeacher;
const requireCourseAccess = async (req, res, next) => {
    try {
        const courseId = req.params.courseId || req.body.courseId;
        if (!courseId) {
            next(new errorHandler_1.AuthenticationError('Course ID required'));
            return;
        }
        if (!req.user) {
            next(new errorHandler_1.AuthenticationError('Authentication required'));
            return;
        }
        if (req.user.type === 'student') {
            const enrollment = await server_1.prisma.enrollment.findUnique({
                where: {
                    studentId_courseId: {
                        studentId: req.user.id,
                        courseId: courseId,
                    },
                },
            });
            if (!enrollment || !enrollment.isActive) {
                next(new errorHandler_1.AuthorizationError('Not enrolled in this course'));
                return;
            }
        }
        else if (req.user.type === 'teacher') {
            const course = await server_1.prisma.course.findUnique({
                where: { id: courseId },
                select: { teacherId: true },
            });
            if (!course || course.teacherId !== req.user.id) {
                next(new errorHandler_1.AuthorizationError('Not authorized for this course'));
                return;
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.requireCourseAccess = requireCourseAccess;
//# sourceMappingURL=auth.js.map