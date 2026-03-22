import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Profile } from '../models/Profile';
import { env } from '../config/env';
import type { JwtPayload } from '../middleware/auth';

const SALT_ROUNDS = 10;

const RegisterSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(64)
    .regex(/^[a-zA-Z0-9._-]+$/, 'Invalid username'),
  schoolName: z.string().min(1, 'School name is required').max(200),
  schoolAddress: z.string().min(1, 'School address is required').max(500),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

const LoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

function signToken(profileId: string, username: string): string {
  const payload: JwtPayload = { sub: profileId, username };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { username, schoolName, schoolAddress, password } = parsed.data;
    const normalized = username.toLowerCase();

    const existing = await Profile.findOne({ username: normalized });
    if (existing) {
      res.status(409).json({
        success: false,
        message: 'Username already taken',
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const profile = await Profile.create({
      username: normalized,
      schoolName: schoolName.trim(),
      schoolAddress: schoolAddress.trim(),
      passwordHash,
    });

    const token = signToken(profile._id.toString(), profile.username);

    res.status(201).json({
      success: true,
      message: 'Account created',
      data: {
        token,
        profile: {
          id: profile._id,
          username: profile.username,
          schoolName: profile.schoolName,
          schoolAddress: profile.schoolAddress,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { username, password } = parsed.data;
    const normalized = username.toLowerCase().trim();

    const profile = await Profile.findOne({ username: normalized }).select('+passwordHash');
    if (!profile) {
      res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
      return;
    }

    const ok = await bcrypt.compare(password, profile.passwordHash);
    if (!ok) {
      res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
      return;
    }

    const token = signToken(profile._id.toString(), profile.username);

    res.json({
      success: true,
      data: {
        token,
        profile: {
          id: profile._id,
          username: profile.username,
          schoolName: profile.schoolName,
          schoolAddress: profile.schoolAddress,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me — requires `authenticate` middleware
 */
export async function me(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.profileId) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const profile = await Profile.findById(req.profileId);
    if (!profile) {
      res.status(404).json({ success: false, message: 'Profile not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        id: profile._id,
        username: profile.username,
        schoolName: profile.schoolName,
        schoolAddress: profile.schoolAddress,
      },
    });
  } catch (error) {
    next(error);
  }
}
