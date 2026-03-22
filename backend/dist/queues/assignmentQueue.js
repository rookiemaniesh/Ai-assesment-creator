"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignmentQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
exports.assignmentQueue = new bullmq_1.Queue('assignment-generation', {
    connection: redis_1.bullMQConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
    },
});
console.log('📋  Assignment queue ready');
//# sourceMappingURL=assignmentQueue.js.map