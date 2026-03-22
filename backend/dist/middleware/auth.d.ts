import { Request, Response, NextFunction } from 'express';
export interface JwtPayload {
    sub: string;
    username: string;
}
/**
 * Require `Authorization: Bearer <jwt>`. Sets `req.profileId` and `req.profileUsername`.
 */
export declare function authenticate(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map