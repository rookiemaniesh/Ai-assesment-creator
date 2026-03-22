import type { Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      /** Set by `authenticate` middleware after valid JWT */
      profileId?: Types.ObjectId;
      profileUsername?: string;
    }
  }
}

export {};
