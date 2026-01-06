"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const server_1 = require("@/server");
const auth_1 = require("@/utils/auth");
const validation_1 = require("@/utils/validation");
const validation_2 = require("@/utils/validation");
const errorHandler_1 = require("@/middleware/errorHandler");
const logger_1 = require("@/utils/logger");
const router = (0, express_1.Router)();
router.post('/register/student', (0, validation_1.validate)(validation_2.registerStudentSchema), async (req, res, next) => {
    try {
        const { email, password, firstName, lastName, studentId } = req.body;
        const existingStudent = await server_1.prisma.student.findFirst({
            where: {
                OR: [
                    { email },
                    { studentId },
                ],
            },
        });
        if (existingStudent) {
            if (existingStudent.email === email) {
                throw new errorHandler_1.ConflictError('Email already registered');
            }
            if (existingStudent.studentId === studentId) {
                throw new errorHandler_1.ConflictError('Student ID already exists');
            }
        }
        const passwordHash = await (0, auth_1.hashPassword)(password);
        const student = await server_1.prisma.student.create({
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
        await server_1.prisma.notificationPreference.create({
            data: {
                studentId: student.id,
            },
        });
        logger_1.logger.info('Student registered successfully', { studentId: student.studentId, email: student.email });
        res.status(201).json({
            message: 'Student registered successfully',
            student,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/login', (0, validation_1.validate)(validation_2.loginSchema), async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const student = await server_1.prisma.student.findUnique({
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
            throw new errorHandler_1.AuthenticationError('Invalid credentials');
        }
        const isValidPassword = await (0, auth_1.comparePassword)(password, student.passwordHash);
        if (!isValidPassword) {
            throw new errorHandler_1.AuthenticationError('Invalid credentials');
        }
        const tokens = (0, auth_1.generateTokens)({
            id: student.id,
            email: student.email,
            type: 'student',
            studentId: student.studentId,
        });
        const refreshTokenKey = `refresh_token:${student.id}`;
        await server_1.redisClient.setEx(refreshTokenKey, 7 * 24 * 60 * 60, tokens.refreshToken);
        await server_1.prisma.student.update({
            where: { id: student.id },
            data: { lastLoginAt: new Date() },
        });
        logger_1.logger.info('Student logged in successfully', { studentId: student.studentId, email: student.email });
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
    }
    catch (error) {
        next(error);
    }
});
router.post('/refresh', (0, validation_1.validate)(validation_2.refreshTokenSchema), async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const decoded = (0, auth_1.verifyRefreshToken)(refreshToken);
        const refreshTokenKey = `refresh_token:${decoded.id}`;
        const storedToken = await server_1.redisClient.get(refreshTokenKey);
        if (!storedToken || storedToken !== refreshToken) {
            throw new errorHandler_1.AuthenticationError('Invalid refresh token');
        }
        let user;
        if (decoded.type === 'student') {
            user = await server_1.prisma.student.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    email: true,
                    studentId: true,
                    isActive: true,
                },
            });
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
        }
        if (!user || !user.isActive) {
            await server_1.redisClient.del(refreshTokenKey);
            throw new errorHandler_1.AuthenticationError('Invalid user');
        }
        const tokens = (0, auth_1.generateTokens)({
            id: decoded.id,
            email: user.email,
            type: decoded.type,
            studentId: decoded.type === 'student' ? user.studentId : undefined,
            teacherId: decoded.type === 'teacher' ? user.teacherId : undefined,
        });
        await server_1.redisClient.setEx(refreshTokenKey, 7 * 24 * 60 * 60, tokens.refreshToken);
        logger_1.logger.info('Token refreshed successfully', { userId: decoded.id, type: decoded.type });
        res.json({
            message: 'Token refreshed successfully',
            tokens,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/logout', async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                logger_1.logger.info('User logged out');
            }
            catch (error) {
            }
        }
        res.json({
            message: 'Logged out successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/logout-all', async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const jwtSecret = process.env.JWT_SECRET;
                if (jwtSecret) {
                    const jwt = require('jsonwebtoken');
                    const decoded = jwt.verify(token, jwtSecret);
                    const refreshTokenKey = `refresh_token:${decoded.id}`;
                    await server_1.redisClient.del(refreshTokenKey);
                    logger_1.logger.info('User logged out from all devices', { userId: decoded.id });
                }
            }
            catch (error) {
            }
        }
        res.json({
            message: 'Logged out from all devices successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/me', async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errorHandler_1.AuthenticationError('No token provided');
        }
        const token = authHeader.substring(7);
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT secret not configured');
        }
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, jwtSecret);
        let user;
        if (decoded.type === 'student') {
            user = await server_1.prisma.student.findUnique({
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
        }
        else if (decoded.type === 'teacher') {
            user = await server_1.prisma.teacher.findUnique({
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
            throw new errorHandler_1.AuthenticationError('Invalid user');
        }
        res.json({
            user: {
                ...user,
                type: decoded.type,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map