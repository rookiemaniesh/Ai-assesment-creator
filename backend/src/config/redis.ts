import IORedis from 'ioredis';
import { env } from './env';

// Upstash uses `rediss://` (TLS). ioredis handles both `redis://` and `rediss://` natively.
const redis = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  // Required for Upstash TLS — safely ignored for local non-TLS connections
  tls: env.REDIS_URL.startsWith('rediss://') ? {} : undefined,
});

redis.on('connect', () => console.log('✅  Redis connected'));
redis.on('error', (err) => console.error('❌  Redis error:', err));

/**
 * BullMQ ships its own bundled ioredis, so we pass plain ConnectionOptions
 * to avoid the type version conflict. Parses both redis:// and rediss:// URLs.
 */
function parseBullMQConnection(redisUrl: string) {
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

export const bullMQConnection = parseBullMQConnection(env.REDIS_URL);

export default redis;
