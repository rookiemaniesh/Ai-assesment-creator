"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const axios_1 = __importDefault(require("axios"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
// `pdf-parse` ships with `export =` typings; cast to avoid TS import-shape issues.
const pdfParse = require('pdf-parse');
const redis_1 = require("../config/redis");
const Assignment_1 = require("../models/Assignment");
const Profile_1 = require("../models/Profile");
const QuestionPaper_1 = require("../models/QuestionPaper");
const wsServer_1 = require("../ws/wsServer");
const env_1 = require("../config/env");
const db_1 = require("../config/db");
// The worker runs in its own process — needs its own DB connection.
(0, db_1.connectDB)();
// ─── Worker ───────────────────────────────────────────────────────────────────
const worker = new bullmq_1.Worker('assignment-generation', async (job) => {
    const { assignmentId, clientId } = job.data;
    console.log(`⚙️  Processing job ${job.id} for assignment ${assignmentId}`);
    // 1. Fetch assignment
    const assignment = await Assignment_1.Assignment.findById(assignmentId);
    if (!assignment)
        throw new Error(`Assignment ${assignmentId} not found`);
    // Update status → processing
    assignment.status = 'processing';
    await assignment.save();
    if (clientId) {
        (0, wsServer_1.emitToClient)(clientId, 'job:progress', {
            assignmentId,
            message: 'AI generation started…',
            progress: 10,
        });
    }
    const profile = await Profile_1.Profile.findById(assignment.profileId).select('schoolName schoolAddress');
    // If a PDF was uploaded, extract its plain text so the AI service has context.
    // (frontend -> backend stores `fileUrl`; AI prompt uses `fileText`.)
    if (assignment.fileUrl && !assignment.fileText?.trim()) {
        try {
            const resolvedPath = path_1.default.isAbsolute(assignment.fileUrl)
                ? assignment.fileUrl
                : path_1.default.resolve(__dirname, '..', '..', assignment.fileUrl);
            const pdfBuffer = await promises_1.default.readFile(resolvedPath);
            const parsed = await pdfParse(pdfBuffer);
            // Keep storage reasonable; prompt builder already truncates for context.
            assignment.fileText = (parsed.text ?? '').toString().slice(0, 20000);
            await assignment.save();
        }
        catch (err) {
            console.error('PDF text extraction failed:', err);
            assignment.fileText = '';
            await assignment.save();
        }
    }
    // 2. Call PydanticAI microservice
    const response = await axios_1.default.post(`${env_1.env.AI_SERVICE_URL}/generate`, {
        title: assignment.title,
        subject: assignment.subject,
        schoolName: profile?.schoolName ?? '',
        schoolAddress: profile?.schoolAddress ?? '',
        totalMarks: assignment.totalMarks,
        numQuestions: assignment.numQuestions,
        questionTypes: assignment.questionTypes,
        ...(assignment.questionSpec?.length
            ? { questionSpec: assignment.questionSpec }
            : {}),
        difficulty: assignment.difficulty,
        additionalInstructions: assignment.additionalInstructions ?? '',
        fileText: assignment.fileText ?? '',
    }, { timeout: 120000 } // 2 min timeout for LLM
    );
    if (clientId) {
        (0, wsServer_1.emitToClient)(clientId, 'job:progress', {
            assignmentId,
            message: 'Saving question paper…',
            progress: 80,
        });
    }
    // 3. Save validated QuestionPaper (structure comes validated from PydanticAI)
    const paperData = response.data;
    await QuestionPaper_1.QuestionPaper.create({
        profileId: assignment.profileId,
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
        (0, wsServer_1.emitToClient)(clientId, 'job:complete', {
            assignmentId,
            message: 'Question paper ready!',
            progress: 100,
        });
    }
    console.log(`✅  Job ${job.id} completed`);
}, {
    connection: redis_1.bullMQConnection,
    concurrency: 3,
});
// ─── Lifecycle hooks ─────────────────────────────────────────────────────────
worker.on('failed', async (job, err) => {
    console.error(`❌  Job ${job?.id} failed:`, err.message);
    if (job?.data.assignmentId) {
        await Assignment_1.Assignment.findByIdAndUpdate(job.data.assignmentId, {
            status: 'failed',
            errorMessage: err.message,
        });
        if (job.data.clientId) {
            (0, wsServer_1.emitToClient)(job.data.clientId, 'job:failed', {
                assignmentId: job.data.assignmentId,
                message: `Generation failed: ${err.message}`,
            });
        }
    }
});
worker.on('error', (err) => console.error('Worker error:', err));
console.log('🤖  Generation worker started');
//# sourceMappingURL=generationWorker.js.map