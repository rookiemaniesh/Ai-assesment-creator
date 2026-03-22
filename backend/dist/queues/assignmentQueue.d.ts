import { Queue } from 'bullmq';
export interface AssignmentJobData {
    assignmentId: string;
    clientId?: string;
}
export type AssignmentJobName = 'generate';
export declare const assignmentQueue: Queue<AssignmentJobData, void, "generate", AssignmentJobData, void, "generate">;
//# sourceMappingURL=assignmentQueue.d.ts.map