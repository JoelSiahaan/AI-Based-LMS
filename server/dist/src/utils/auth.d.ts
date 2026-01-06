import { JWTPayload } from '@/middleware/auth';
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
export declare const generateTokens: (payload: Omit<JWTPayload, "iat" | "exp">) => TokenPair;
export declare const verifyRefreshToken: (token: string) => {
    id: string;
    type: "student" | "teacher";
};
export declare const generateSecurePassword: () => string;
//# sourceMappingURL=auth.d.ts.map