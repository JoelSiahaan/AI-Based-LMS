// Global type declarations for missing modules

declare module 'json-schema' {
  export interface JSONSchema4 {
    [key: string]: any;
  }
  
  export interface JSONSchema6 {
    [key: string]: any;
  }
  
  export interface JSONSchema7 {
    [key: string]: any;
  }
}

// Extend Express Request type for our custom properties
declare namespace Express {
  interface Request {
    user?: {
      id: string;
      email: string;
      type: 'student' | 'teacher';
      studentId?: string;
      teacherId?: string;
    };
  }
}

// Environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: string;
    DATABASE_URL: string;
    REDIS_URL: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    CORS_ORIGIN: string;
    UPLOAD_DIR: string;
    MAX_FILE_SIZE: string;
    ALLOWED_FILE_TYPES: string;
    RATE_LIMIT_WINDOW_MS: string;
    RATE_LIMIT_MAX_REQUESTS: string;
    AUTH_RATE_LIMIT_MAX_REQUESTS: string;
    LOG_LEVEL: string;
    LOG_FILE: string;
  }
}