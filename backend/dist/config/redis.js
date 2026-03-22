"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bullMQConnection = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./env");
// Upstash uses `rediss://` (TLS). ioredis handles both `redis://` and `rediss://` natively.
const redis = new ioredis_1.default(env_1.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    // Required for Upstash TLS — safely ignored for local non-TLS connections
    tls: env_1.env.REDIS_URL.startsWith('rediss://') ? {} : undefined,
});
redis.on('connect', () => console.log('✅  Redis connected'));
redis.on('error', (err) => console.error('❌  Redis error:', err));
/**
 * BullMQ ships its own bundled ioredis, so we pass plain ConnectionOptions
 * to avoid the type version conflict. Parses both redis:// and rediss:// URLs.
 */
function parseBullMQConnection(redisUrl) {
    const isTls = redisUrl.startsWith('rediss://');
    // normalise to http:// so URL() can parse it
    const parsed = new URL(redisUrl.replace(/^rediss?:\/\//, 'http://'));
    return {
        host: parsed.hostname,
        port: parseInt(parsed.port || '6379', 10),
        // Upstash uses `default` as the username; password is in the URL
        username: parsed.username || undefined,
        password: parsed.password || undefined,
        tls: isTls ? {} : undefined,
    };
}
exports.bullMQConnection = parseBullMQConnection(env_1.env.REDIS_URL);
exports.default = redis;
//# sourceMappingURL=redis.js.map