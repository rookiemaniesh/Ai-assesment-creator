import { Request, Response, NextFunction } from 'express';
/**
 * POST /api/assignments
 * Creates an assignment, enqueues an AI generation job, returns job info.
 */
export declare function createAssignment(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/assignments
 * Lists all assignments, newest first. Supports ?page=1&limit=10
 */
export declare function listAssignments(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/assignments/:id
 * Returns a single assignment with its current status.
 */
export declare function getAssignment(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/assignments/:id/result
 * Returns the generated question paper for an assignment.
 */
export declare function getAssignmentResult(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=assignment.controller.d.ts.map