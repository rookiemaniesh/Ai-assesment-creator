import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Assignment } from '../models/Assignment';
import { QuestionPaper } from '../models/QuestionPaper';
import { assignmentQueue } from '../queues/assignmentQueue';
import mongoose from 'mongoose';

// ─── Validation schema ───────────────────────────────────────────────────────

const CreateAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subject: z.string().min(1, 'Subject is required'),
  dueDate: z.string().refine((d) => !isNaN(Date.parse(d)), {
    message: 'Invalid date format',
  }),
  totalMarks: z.coerce.number().int().min(1, 'Total marks must be ≥ 1'),
  numQuestions: z.coerce
    .number()
    .int()
    .min(1, 'Must have at least 1 question')
    .max(100, 'Cannot exceed 100 questions'),
  questionTypes: z
    .array(z.enum(['mcq', 'short', 'long', 'true-false']))
    .min(1, 'Select at least one question type'),
  difficulty: z
    .enum(['easy', 'medium', 'hard', 'mixed'])
    .default('mixed'),
  additionalInstructions: z.string().max(1000).optional(),
  clientId: z.string().optional(), // WebSocket push target
});

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/assignments
 * Creates an assignment, enqueues an AI generation job, returns job info.
 */
export async function createAssignment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
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
    let fileUrl: string | undefined;
    let fileText: string | undefined;

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

    const assignment = await Assignment.create({
      ...rest,
      profileId: req.profileId,
      dueDate: new Date(dueDate),
      status: 'pending',
      fileUrl,
      fileText,
    });

    // Enqueue generation job
    const job = await assignmentQueue.add(
      'generate',
      { assignmentId: assignment._id.toString(), clientId },
      { jobId: `asgn-${assignment._id.toString()}` }
    );

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
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/assignments
 * Lists all assignments, newest first. Supports ?page=1&limit=10
 */
export async function listAssignments(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.profileId) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    const filter = { profileId: req.profileId };

    const [assignments, total] = await Promise.all([
      Assignment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-fileText'), // exclude large text blob from list
      Assignment.countDocuments(filter),
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
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/assignments/:id
 * Returns a single assignment with its current status.
 */
export async function getAssignment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid assignment ID' });
      return;
    }

    const assignment = await Assignment.findById(req.params.id).select('-fileText');
    if (!assignment) {
      res.status(404).json({ success: false, message: 'Assignment not found' });
      return;
    }

    if (!req.profileId || assignment.profileId.toString() !== req.profileId.toString()) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    res.json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/assignments/:id/result
 * Returns the generated question paper for an assignment.
 */
export async function getAssignmentResult(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid assignment ID' });
      return;
    }

    const assignment = await Assignment.findById(req.params.id);
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

    const paper = await QuestionPaper.findOne({ assignmentId: assignment._id });
    if (!paper) {
      res.status(404).json({ success: false, message: 'Question paper not found' });
      return;
    }

    res.json({ success: true, data: paper });
  } catch (error) {
    next(error);
  }
}
