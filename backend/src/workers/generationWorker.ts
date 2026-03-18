import { Worker, Job } from 'bullmq';
import axios from 'axios';
import { bullMQConnection } from '../config/redis';
import { Assignment } from '../models/Assignment';
import { QuestionPaper } from '../models/QuestionPaper';
import { emitToClient } from '../ws/wsServer';
import { env } from '../config/env';
import { connectDB } from '../config/db';
import type { AssignmentJobData, AssignmentJobName } from '../queues/assignmentQueue';

// The worker runs in its own process — needs its own DB connection.
connectDB();

// ─── Worker ───────────────────────────────────────────────────────────────────

const worker = new Worker<AssignmentJobData, void, AssignmentJobName>(
  'assignment-generation',
  async (job: Job<AssignmentJobData>) => {
    const { assignmentId, clientId } = job.data;

    console.log(`⚙️  Processing job ${job.id} for assignment ${assignmentId}`);

    // 1. Fetch assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);

    // Update status → processing
    assignment.status = 'processing';
    await assignment.save();

    if (clientId) {
      emitToClient(clientId, 'job:progress', {
        assignmentId,
        message: 'AI generation started…',
        progress: 10,
      });
    }

    // 2. Call PydanticAI microservice
    const response = await axios.post(
      `${env.AI_SERVICE_URL}/generate`,
      {
        title: assignment.title,
        subject: assignment.subject,
        totalMarks: assignment.totalMarks,
        numQuestions: assignment.numQuestions,
        questionTypes: assignment.questionTypes,
        difficulty: assignment.difficulty,
        additionalInstructions: assignment.additionalInstructions ?? '',
        fileText: assignment.fileText ?? '',
      },
      { timeout: 120_000 } // 2 min timeout for LLM
    );

    if (clientId) {
      emitToClient(clientId, 'job:progress', {
        assignmentId,
        message: 'Saving question paper…',
        progress: 80,
      });
    }

    // 3. Save validated QuestionPaper (structure comes validated from PydanticAI)
    const paperData = response.data as {
      sections: Array<{
        label: string;
        questions: Array<{
          number: number;
          text: string;
          type: string;
          difficulty: string;
          marks: number;
          options?: string[];
          answer?: string;
        }>;
      }>;
      totalMarks: number;
    };

    await QuestionPaper.create({
      assignmentId: assignment._id,
      sections: paperData.sections,
      totalMarks: paperData.totalMarks,
      generatedAt: new Date(),
    });

    // 4. Mark assignment complete
    assignment.status = 'completed';
    await assignment.save();

    // 5. Notify frontend
    if (clientId) {
      emitToClient(clientId, 'job:complete', {
        assignmentId,
        message: 'Question paper ready!',
        progress: 100,
      });
    }

    console.log(`✅  Job ${job.id} completed`);
  },
  {
    connection: bullMQConnection,
    concurrency: 3,
  }
);

// ─── Lifecycle hooks ─────────────────────────────────────────────────────────

worker.on('failed', async (job, err) => {
  console.error(`❌  Job ${job?.id} failed:`, err.message);

  if (job?.data.assignmentId) {
    await Assignment.findByIdAndUpdate(job.data.assignmentId, {
      status: 'failed',
      errorMessage: err.message,
    });

    if (job.data.clientId) {
      emitToClient(job.data.clientId, 'job:failed', {
        assignmentId: job.data.assignmentId,
        message: `Generation failed: ${err.message}`,
      });
    }
  }
});

worker.on('error', (err) => console.error('Worker error:', err));

console.log('🤖  Generation worker started');
