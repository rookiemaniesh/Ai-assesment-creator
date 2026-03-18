import { Queue } from 'bullmq';
import { bullMQConnection } from '../config/redis';

export interface AssignmentJobData {
  assignmentId: string;
  clientId?: string; // WebSocket client ID for push notification
}

// Job name literal type — keeps the queue strictly typed
export type AssignmentJobName = 'generate';

export const assignmentQueue = new Queue<AssignmentJobData, void, AssignmentJobName>(
  'assignment-generation',
  {
    connection: bullMQConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    },
  }
);

console.log('📋  Assignment queue ready');
