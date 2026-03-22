"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
/**
 * Require `Authorization: Bearer <jwt>`. Sets `req.profileId` and `req.profileUsername`.
 */
function authenticate(req, res, next) {
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
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        if (!decoded.sub || !mongoose_1.default.isValidObjectId(decoded.sub)) {
            res.status(401).json({ success: false, message: 'Invalid token payload' });
            return;
        }
        req.profileId = new mongoose_1.default.Types.ObjectId(decoded.sub);
        req.profileUsername = decoded.username;
        next();
    }
    catch {
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
}
//# sourceMappingURL=auth.js.map