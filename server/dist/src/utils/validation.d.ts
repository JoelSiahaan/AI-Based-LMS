import Joi from 'joi';
export declare const emailSchema: Joi.StringSchema<string>;
export declare const passwordSchema: Joi.StringSchema<string>;
export declare const studentIdSchema: Joi.StringSchema<string>;
export declare const nameSchema: Joi.StringSchema<string>;
export declare const loginSchema: Joi.ObjectSchema<any>;
export declare const registerStudentSchema: Joi.ObjectSchema<any>;
export declare const refreshTokenSchema: Joi.ObjectSchema<any>;
export declare const courseSchema: Joi.ObjectSchema<any>;
export declare const assignmentSchema: Joi.ObjectSchema<any>;
export declare const messageSchema: Joi.ObjectSchema<any>;
export declare const notificationPreferenceSchema: Joi.ObjectSchema<any>;
export declare const fileUploadSchema: Joi.ObjectSchema<any>;
export declare const paginationSchema: Joi.ObjectSchema<any>;
export declare const idSchema: Joi.StringSchema<string>;
export declare const validate: (schema: Joi.ObjectSchema) => (req: any, res: any, next: any) => any;
export declare const validateQuery: (schema: Joi.ObjectSchema) => (req: any, res: any, next: any) => any;
export declare const validateParams: (schema: Joi.ObjectSchema) => (req: any, res: any, next: any) => any;
//# sourceMappingURL=validation.d.ts.map