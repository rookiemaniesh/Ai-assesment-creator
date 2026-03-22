import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { env } from '../config/env';

export interface JwtPayload {
  sub: string;
  username: string;
}

/**
 * Require `Authorization: Bearer <jwt>`. Sets `req.profileId` and `req.profileUsername`.
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7).trim() : null;

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. Send Authorization: Bearer <token>',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    if (!decoded.sub || !mongoose.isValidObjectId(decoded.sub)) {
      res.status(401).json({ success: false, message: 'Invalid token payload' });
      return;
    }
    req.profileId = new mongoose.Types.ObjectId(decoded.sub);
    req.profileUsername = decoded.username;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}
