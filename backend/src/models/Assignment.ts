import mongoose, { Document, Schema } from 'mongoose';

// ─── Types ──────────────────────────────────────────────────────────────────

export type QuestionType = 'mcq' | 'short' | 'long' | 'true-false';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';
export type AssignmentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface IAssignment extends Document {
  title: string;
  subject: string;
  dueDate: Date;
  totalMarks: number;
  numQuestions: number;
  questionTypes: QuestionType[];
  difficulty: Difficulty;
  additionalInstructions?: string;
  fileUrl?: string;       // path to uploaded PDF on disk
  fileText?: string;      // extracted plain text from PDF
  status: AssignmentStatus;
  jobId?: string;         // BullMQ job ID
  errorMessage?: string;  // set on failure
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks is required'],
      min: [1, 'Total marks must be at least 1'],
    },
    numQuestions: {
      type: Number,
      required: [true, 'Number of questions is required'],
      min: [1, 'Must have at least 1 question'],
      max: [100, 'Cannot exceed 100 questions'],
    },
    questionTypes: {
      type: [String],
      enum: ['mcq', 'short', 'long', 'true-false'],
      required: [true, 'At least one question type is required'],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: 'At least one question type must be selected',
      },
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'mixed'],
      default: 'mixed',
    },
    additionalInstructions: {
      type: String,
      maxlength: [1000, 'Instructions cannot exceed 1000 characters'],
    },
    fileUrl: { type: String },
    fileText: { type: String },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    jobId: { type: String },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

// Index for fast status-based queries
AssignmentSchema.index({ status: 1, createdAt: -1 });

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
