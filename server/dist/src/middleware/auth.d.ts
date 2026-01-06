import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        type: 'student' | 'teacher';
        studentId?: string;
        teacherId?: string;
    };
}
export interface JWTPayload {
    id: string;
    email: string;
    type: 'student' | 'teacher';
    studentId?: string;
    teacherId?: string;
    iat?: number;
    exp?: number;
}
export declare const authMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireStudent: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireTeacher: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireCourseAccess: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map