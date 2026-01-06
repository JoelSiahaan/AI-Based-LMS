"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogger = void 0;
const server_1 = require("@/server");
const logger_1 = require("@/utils/logger");
const auditLogger = async (req, res, next) => {
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
            setImmediate(async () => {
                try {
                    await server_1.prisma.auditLog.create({
                        data: {
                            userId: req.user.id,
                            userType: req.user.type.toUpperCase(),
                            action: `${req.method} ${req.route?.path || req.path}`,
                            resource: extractResourceFromPath(req.path),
                            details: {
                                method: req.method,
                                path: req.path,
                                statusCode: res.statusCode,
                                userAgent: req.get('User-Agent'),
                                params: req.params,
                                query: req.query,
                                body: sanitizeBody(req.body),
                            },
                            ipAddress: req.ip,
                            userAgent: req.get('User-Agent'),
                        },
                    });
                }
                catch (error) {
                    logger_1.logger.error('Failed to create audit log:', error);
                }
            });
        }
        originalEnd.call(this, chunk, encoding);
    };
    next();
};
exports.auditLogger = auditLogger;
function extractResourceFromPath(path) {
    const pathParts = path.split('/').filter(part => part);
    if (pathParts.length >= 2 && pathParts[0] === 'api') {
        return pathParts[1];
    }
    return 'unknown';
}
function sanitizeBody(body) {
    if (!body || typeof body !== 'object') {
        return body;
    }
    const sanitized = { ...body };
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
//# sourceMappingURL=auditLogger.js.map