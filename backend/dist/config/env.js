"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('5000'),
    MONGO_URI: zod_1.z.string({ error: 'MONGO_URI is required' }),
    REDIS_URL: zod_1.z.string().default('redis://localhost:6379'),
    AI_SERVICE_URL: zod_1.z.string().default('http://localhost:8000'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    /** Used to sign JWTs for `/api/auth` — set a long random string in production */
    JWT_SECRET: zod_1.z
        .string()
        .min(16, 'JWT_SECRET must be at least 16 characters')
        .default('veda-ai-dev-jwt-secret-change-in-prod'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌  Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}
exports.env = parsed.data;
//# sourceMappingURL=env.js.map