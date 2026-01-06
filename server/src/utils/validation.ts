import Joi from 'joi';

// Common validation schemas
export const emailSchema = Joi.string()
  .email()
  .lowercase()
  .trim()
  .required()
  .messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  });

export const passwordSchema = Joi.string()
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

export const studentIdSchema = Joi.string()
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

export const nameSchema = Joi.string()
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

// Authentication validation schemas
export const loginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

export const registerStudentSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  studentId: studentIdSchema,
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required',
  }),
});

// Course validation schemas
export const courseSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  description: Joi.string().trim().max(1000).optional(),
  courseCode: Joi.string().alphanum().min(3).max(20).required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
});

// Assignment validation schemas
export const assignmentSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  description: Joi.string().trim().min(1).max(2000).required(),
  dueDate: Joi.date().iso().min('now').required(),
  maxPoints: Joi.number().positive().max(1000).required(),
  allowedFileTypes: Joi.array().items(Joi.string().valid('pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif')).min(1).required(),
  maxFileSize: Joi.number().positive().max(10485760).required(), // 10MB max
});

// Message validation schemas
export const messageSchema = Joi.object({
  content: Joi.string().trim().min(1).max(2000).required(),
  receiverId: Joi.string().optional(),
  courseId: Joi.string().optional(),
  type: Joi.string().valid('DIRECT', 'FORUM', 'ANNOUNCEMENT').default('DIRECT'),
}).or('receiverId', 'courseId'); // At least one must be present

// Notification preference validation
export const notificationPreferenceSchema = Joi.object({
  assignmentReminders: Joi.boolean().default(true),
  gradeNotifications: Joi.boolean().default(true),
  messageNotifications: Joi.boolean().default(true),
  announcementNotifications: Joi.boolean().default(true),
  emailNotifications: Joi.boolean().default(true),
  pushNotifications: Joi.boolean().default(true),
});

// File upload validation
export const fileUploadSchema = Joi.object({
  assignmentId: Joi.string().required(),
  files: Joi.array().items(Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().required(),
    size: Joi.number().positive().max(10485760).required(), // 10MB max
    buffer: Joi.binary().required(),
  })).min(1).max(5).required(),
});

// Pagination validation
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

// Generic ID validation
export const idSchema = Joi.string().required().messages({
  'any.required': 'ID is required',
  'string.base': 'ID must be a string',
});

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
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

// Query parameter validation middleware
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
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

// Parameter validation middleware
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
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