import IORedis from 'ioredis';
declare const redis: IORedis;
export declare const bullMQConnection: {
    host: string;
    port: number;
    username: string | undefined;
    password: string | undefined;
    tls: {} | undefined;
};
export default redis;
//# sourceMappingURL=redis.d.ts.map