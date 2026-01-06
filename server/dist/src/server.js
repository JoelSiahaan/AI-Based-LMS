"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const client_1 = require("@prisma/client");
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("@/utils/logger");
const errorHandler_1 = require("@/middleware/errorHandler");
const requestLogger_1 = require("@/middleware/requestLogger");
const auth_1 = require("@/middleware/auth");
const auditLogger_1 = require("@/middleware/auditLogger");
const auth_2 = __importDefault(require("@/routes/auth"));
const students_1 = __importDefault(require("@/routes/students"));
const courses_1 = __importDefault(require("@/routes/courses"));
const assignments_1 = __importDefault(require("@/routes/assignments"));
const grades_1 = __importDefault(require("@/routes/grades"));
const messages_1 = __importDefault(require("@/routes/messages"));
const notifications_1 = __importDefault(require("@/routes/notifications"));
dotenv_1.default.config();
exports.prisma = new client_1.PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});
exports.redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
});
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: {
        error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '5'),
    message: {
        error: 'Too many authentication attempts, please try again later.',
    },
    skipSuccessfulRequests: true,
});
app.use('/api/auth', authLimiter);
app.use(requestLogger_1.requestLogger);
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
    });
});
app.use('/api/auth', auth_2.default);
app.use('/api/students', auth_1.authMiddleware, auditLogger_1.auditLogger, students_1.default);
app.use('/api/courses', auth_1.authMiddleware, auditLogger_1.auditLogger, courses_1.default);
app.use('/api/assignments', auth_1.authMiddleware, auditLogger_1.auditLogger, assignments_1.default);
app.use('/api/grades', auth_1.authMiddleware, auditLogger_1.auditLogger, grades_1.default);
app.use('/api/messages', auth_1.authMiddleware, auditLogger_1.auditLogger, messages_1.default);
app.use('/api/notifications', auth_1.authMiddleware, auditLogger_1.auditLogger, notifications_1.default);
app.use('/uploads', express_1.default.static('uploads'));
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
    });
});
app.use(errorHandler_1.errorHandler);
const gracefulShutdown = async (signal) => {
    logger_1.logger.info(`Received ${signal}. Starting graceful shutdown...`);
    try {
        await exports.prisma.$disconnect();
        logger_1.logger.info('Database connection closed');
        await exports.redisClient.quit();
        logger_1.logger.info('Redis connection closed');
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error('Error during graceful shutdown:', error);
        process.exit(1);
    }
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
const startServer = async () => {
    try {
        await exports.redisClient.connect();
        logger_1.logger.info('Connected to Redis');
        await exports.prisma.$connect();
        logger_1.logger.info('Connected to PostgreSQL');
        app.listen(PORT, () => {
            logger_1.logger.info(`Server running on port ${PORT}`);
            logger_1.logger.info(`Environment: ${process.env.NODE_ENV}`);
            logger_1.logger.info(`Health check: http://localhost:${PORT}/health`);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught Exception:', error);
    process.exit(1);
});
startServer();
//# sourceMappingURL=server.js.map