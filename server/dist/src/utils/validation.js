"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = exports.validateQuery = exports.validate = exports.idSchema = exports.paginationSchema = exports.fileUploadSchema = exports.notificationPreferenceSchema = exports.messageSchema = exports.assignmentSchema = exports.courseSchema = exports.refreshTokenSchema = exports.registerStudentSchema = exports.loginSchema = exports.nameSchema = exports.studentIdSchema = exports.passwordSchema = exports.emailSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.emailSchema = joi_1.default.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
});
exports.passwordSchema = joi_1.default.string()
    .min(8)
    .max(128)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must not exceed 128 characters',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    'any.required': 'Password is required',
});
exports.studentIdSchema = joi_1.default.string()
    .alphanum()
    .min(6)
    .max(20)
    .required()
    .messages({
    'string.alphanum': 'Student ID must contain only letters and numbers',
    'string.min': 'Student ID must be at least 6 characters long',
    'string.max': 'Student ID must not exceed 20 characters',
    'any.required': 'Student ID is required',
});
exports.nameSchema = joi_1.default.string()
    .trim()
    .min(1)
    .max(50)
    .pattern(new RegExp('^[a-zA-Z\\s\\-\']+$'))
    .required()
    .messages({
    'string.min': 'Name must not be empty',
    'string.max': 'Name must not exceed 50 characters',
    'string.pattern.base': 'Name can only contain letters, spaces, hyphens, and apostrophes',
    'any.required': 'Name is required',
});
exports.loginSchema = joi_1.default.object({
    email: exports.emailSchema,
    password: joi_1.default.string().required().messages({
        'any.required': 'Password is required',
    }),
});
exports.registerStudentSchema = joi_1.default.object({
    email: exports.emailSchema,
    password: exports.passwordSchema,
    firstName: exports.nameSchema,
    lastName: exports.nameSchema,
    studentId: exports.studentIdSchema,
});
exports.refreshTokenSchema = joi_1.default.object({
    refreshToken: joi_1.default.string().required().messages({
        'any.required': 'Refresh token is required',
    }),
});
exports.courseSchema = joi_1.default.object({
    title: joi_1.default.string().trim().min(1).max(200).required(),
    description: joi_1.default.string().trim().max(1000).optional(),
    courseCode: joi_1.default.string().alphanum().min(3).max(20).required(),
    startDate: joi_1.default.date().iso().required(),
    endDate: joi_1.default.date().iso().greater(joi_1.default.ref('startDate')).required(),
});
exports.assignmentSchema = joi_1.default.object({
    title: joi_1.default.string().trim().min(1).max(200).required(),
    description: joi_1.default.string().trim().min(1).max(2000).required(),
    dueDate: joi_1.default.date().iso().min('now').required(),
    maxPoints: joi_1.default.number().positive().max(1000).required(),
    allowedFileTypes: joi_1.default.array().items(joi_1.default.string().valid('pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif')).min(1).required(),
    maxFileSize: joi_1.default.number().positive().max(10485760).required(),
});
exports.messageSchema = joi_1.default.object({
    content: joi_1.default.string().trim().min(1).max(2000).required(),
    receiverId: joi_1.default.string().optional(),
    courseId: joi_1.default.string().optional(),
    type: joi_1.default.string().valid('DIRECT', 'FORUM', 'ANNOUNCEMENT').default('DIRECT'),
}).or('receiverId', 'courseId');
exports.notificationPreferenceSchema = joi_1.default.object({
    assignmentReminders: joi_1.default.boolean().default(true),
    gradeNotifications: joi_1.default.boolean().default(true),
    messageNotifications: joi_1.default.boolean().default(true),
    announcementNotifications: joi_1.default.boolean().default(true),
    emailNotifications: joi_1.default.boolean().default(true),
    pushNotifications: joi_1.default.boolean().default(true),
});
exports.fileUploadSchema = joi_1.default.object({
    assignmentId: joi_1.default.string().required(),
    files: joi_1.default.array().items(joi_1.default.object({
        fieldname: joi_1.default.string().required(),
        originalname: joi_1.default.string().required(),
        encoding: joi_1.default.string().required(),
        mimetype: joi_1.default.string().required(),
        size: joi_1.default.number().positive().max(10485760).required(),
        buffer: joi_1.default.binary().required(),
    })).min(1).max(5).required(),
});
exports.paginationSchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(20),
    sortBy: joi_1.default.string().optional(),
    sortOrder: joi_1.default.string().valid('asc', 'desc').default('desc'),
});
exports.idSchema = joi_1.default.string().required().messages({
    'any.required': 'ID is required',
    'string.base': 'ID must be a string',
});
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({
                error: {
                    code: 'ValidationError',
                    message: errorMessage,
                    details: error.details,
                    timestamp: new Date().toISOString(),
                },
            });
        }
        req.body = value;
        next();
    };
};
exports.validate = validate;
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({
                error: {
                    code: 'ValidationError',
                    message: errorMessage,
                    details: error.details,
                    timestamp: new Date().toISOString(),
                },
            });
        }
        req.query = value;
        next();
    };
};
exports.validateQuery = validateQuery;
const validateParams = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({
                error: {
                    code: 'ValidationError',
                    message: errorMessage,
                    details: error.details,
                    timestamp: new Date().toISOString(),
                },
            });
        }
        req.params = value;
        next();
    };
};
exports.validateParams = validateParams;
//# sourceMappingURL=validation.js.map