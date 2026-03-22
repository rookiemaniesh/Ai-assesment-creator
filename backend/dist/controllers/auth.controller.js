"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.me = me;
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Profile_1 = require("../models/Profile");
const env_1 = require("../config/env");
const SALT_ROUNDS = 10;
const RegisterSchema = zod_1.z.object({
    username: zod_1.z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(64)
        .regex(/^[a-zA-Z0-9._-]+$/, 'Invalid username'),
    schoolName: zod_1.z.string().min(1, 'School name is required').max(200),
    schoolAddress: zod_1.z.string().min(1, 'School address is required').max(500),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters').max(128),
});
const LoginSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, 'Username is required'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
function signToken(profileId, username) {
    const payload = { sub: profileId, username };
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, { expiresIn: '7d' });
}
async function register(req, res, next) {
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
        const existing = await Profile_1.Profile.findOne({ username: normalized });
        if (existing) {
            res.status(409).json({
                success: false,
                message: 'Username already taken',
            });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, SALT_ROUNDS);
        const profile = await Profile_1.Profile.create({
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
    }
    catch (error) {
        next(error);
    }
}
async function login(req, res, next) {
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
        const profile = await Profile_1.Profile.findOne({ username: normalized }).select('+passwordHash');
        if (!profile) {
            res.status(401).json({
                success: false,
                message: 'Invalid username or password',
            });
            return;
        }
        const ok = await bcryptjs_1.default.compare(password, profile.passwordHash);
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
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/auth/me — requires `authenticate` middleware
 */
async function me(req, res, next) {
    try {
        if (!req.profileId) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }
        const profile = await Profile_1.Profile.findById(req.profileId);
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
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=auth.controller.js.map