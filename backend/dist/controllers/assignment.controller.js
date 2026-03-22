"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAssignment = createAssignment;
exports.listAssignments = listAssignments;
exports.getAssignment = getAssignment;
exports.getAssignmentResult = getAssignmentResult;
const zod_1 = require("zod");
const Assignment_1 = require("../models/Assignment");
const QuestionPaper_1 = require("../models/QuestionPaper");
const assignmentQueue_1 = require("../queues/assignmentQueue");
const mongoose_1 = __importDefault(require("mongoose"));
// ─── Validation schema ───────────────────────────────────────────────────────
const QuestionSpecEntrySchema = zod_1.z.object({
    questionType: zod_1.z.enum(['mcq', 'short', 'long', 'true-false']),
    count: zod_1.z.coerce.number().int().min(1),
    marksPerQuestion: zod_1.z.coerce.number().int().min(1),
});
const CreateAssignmentSchema = zod_1.z
    .object({
    title: zod_1.z.string().min(1, 'Title is required').max(200),
    subject: zod_1.z.string().min(1, 'Subject is required'),
    dueDate: zod_1.z.string().refine((d) => !isNaN(Date.parse(d)), {
        message: 'Invalid date format',
    }),
    totalMarks: zod_1.z.coerce.number().int().min(1, 'Total marks must be ≥ 1'),
    numQuestions: zod_1.z.coerce
        .number()
        .int()
        .min(1, 'Must have at least 1 question')
        .max(100, 'Cannot exceed 100 questions'),
    questionTypes: zod_1.z
        .array(zod_1.z.enum(['mcq', 'short', 'long', 'true-false']))
        .min(1, 'Select at least one question type'),
    difficulty: zod_1.z
        .enum(['easy', 'medium', 'hard', 'mixed'])
        .default('mixed'),
    additionalInstructions: zod_1.z.string().max(1000).optional(),
    clientId: zod_1.z.string().optional(), // WebSocket push target
    /** JSON array from multipart: exact counts/marks per type from the form */
    questionSpec: zod_1.z.preprocess((raw) => {
        if (raw == null || raw === '')
            return undefined;
        if (typeof raw === 'string') {
            try {
                return JSON.parse(raw);
            }
            catch {
                return undefined;
            }
        }
        if (Array.isArray(raw))
            return raw;
        return undefined;
    }, zod_1.z.array(QuestionSpecEntrySchema).optional()),
})
    .superRefine((data, ctx) => {
    if (!data.questionSpec?.length)
        return;
    const n = data.questionSpec.reduce((s, x) => s + x.count, 0);
    const m = data.questionSpec.reduce((s, x) => s + x.count * x.marksPerQuestion, 0);
    if (n !== data.numQuestions) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: `questionSpec counts (${n}) must match numQuestions (${data.numQuestions})`,
            path: ['questionSpec'],
        });
    }
    if (m !== data.totalMarks) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: `questionSpec marks (${m}) must match totalMarks (${data.totalMarks})`,
            path: ['questionSpec'],
        });
    }
});
// ─── Controllers ─────────────────────────────────────────────────────────────
/**
 * POST /api/assignments
 * Creates an assignment, enqueues an AI generation job, returns job info.
 */
async function createAssignment(req, res, next) {
    try {
        // Validate body
        const result = CreateAssignmentSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                success: false,
                errors: result.error.flatten().fieldErrors,
            });
            return;
        }
        const { clientId, dueDate, ...rest } = result.data;
        // Handle optional PDF upload (file added by multer middleware)
        const file = req.file;
        let fileUrl;
        let fileText;
        if (file) {
            fileUrl = file.path;
            // PDF text extraction happens in the worker for large files;
            // For small files, we can do it inline (optional enhancement)
        }
        // Persist assignment
        if (!req.profileId) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }
        const assignment = await Assignment_1.Assignment.create({
            ...rest,
            profileId: req.profileId,
            dueDate: new Date(dueDate),
            status: 'pending',
            fileUrl,
            fileText,
        });
        // Enqueue generation job
        const job = await assignmentQueue_1.assignmentQueue.add('generate', { assignmentId: assignment._id.toString(), clientId }, { jobId: `asgn-${assignment._id.toString()}` });
        // Update assignment with job ID
        assignment.jobId = job.id ?? undefined;
        assignment.status = 'processing';
        await assignment.save();
        res.status(201).json({
            success: true,
            message: 'Assignment created. AI generation started.',
            data: {
                assignmentId: assignment._id,
                jobId: job.id,
                status: assignment.status,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/assignments
 * Lists all assignments, newest first. Supports ?page=1&limit=10
 */
async function listAssignments(req, res, next) {
    try {
        if (!req.profileId) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, parseInt(req.query.limit) || 10);
        const skip = (page - 1) * limit;
        const filter = { profileId: req.profileId };
        const [assignments, total] = await Promise.all([
            Assignment_1.Assignment.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('-fileText'), // exclude large text blob from list
            Assignment_1.Assignment.countDocuments(filter),
        ]);
        res.json({
            success: true,
            data: assignments,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/assignments/:id
 * Returns a single assignment with its current status.
 */
async function getAssignment(req, res, next) {
    try {
        if (!mongoose_1.default.isValidObjectId(req.params.id)) {
            res.status(400).json({ success: false, message: 'Invalid assignment ID' });
            return;
        }
        const assignment = await Assignment_1.Assignment.findById(req.params.id).select('-fileText');
        if (!assignment) {
            res.status(404).json({ success: false, message: 'Assignment not found' });
            return;
        }
        if (!req.profileId || assignment.profileId.toString() !== req.profileId.toString()) {
            res.status(403).json({ success: false, message: 'Forbidden' });
            return;
        }
        res.json({ success: true, data: assignment });
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/assignments/:id/result
 * Returns the generated question paper for an assignment.
 */
async function getAssignmentResult(req, res, next) {
    try {
        if (!mongoose_1.default.isValidObjectId(req.params.id)) {
            res.status(400).json({ success: false, message: 'Invalid assignment ID' });
            return;
        }
        const assignment = await Assignment_1.Assignment.findById(req.params.id);
        if (!assignment) {
            res.status(404).json({ success: false, message: 'Assignment not found' });
            return;
        }
        if (!req.profileId || assignment.profileId.toString() !== req.profileId.toString()) {
            res.status(403).json({ success: false, message: 'Forbidden' });
            return;
        }
        if (assignment.status === 'pending' || assignment.status === 'processing') {
            res.status(202).json({
                success: false,
                message: `Generation is still in progress. Current status: ${assignment.status}`,
                status: assignment.status,
            });
            return;
        }
        if (assignment.status === 'failed') {
            res.status(422).json({
                success: false,
                message: 'Generation failed',
                error: assignment.errorMessage,
            });
            return;
        }
        const paper = await QuestionPaper_1.QuestionPaper.findOne({ assignmentId: assignment._id });
        if (!paper) {
            res.status(404).json({ success: false, message: 'Question paper not found' });
            return;
        }
        res.json({ success: true, data: paper });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=assignment.controller.js.map