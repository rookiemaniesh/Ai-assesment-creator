import mongoose, { Document, Schema, Types } from 'mongoose';
import type { QuestionType, Difficulty } from './Assignment';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface IQuestion {
  number: number;
  text: string;
  type: QuestionType;
  difficulty: Exclude<Difficulty, 'mixed'>;
  marks: number;
  options?: string[];   // MCQ only — 4 options array
  answer?: string;      // model answer / correct option label
}

export interface ISection {
  label: string;        // "Section A", "Section B", etc.
  questions: IQuestion[];
}

export interface IQuestionPaper extends Document {
  assignmentId: Types.ObjectId;
  sections: ISection[];
  totalMarks: number;
  generatedAt: Date;
}

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

const QuestionSchema = new Schema<IQuestion>(
  {
    number: { type: Number, required: true },
    text:   { type: String, required: true },
    type: {
      type: String,
      enum: ['mcq', 'short', 'long', 'true-false'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    marks:   { type: Number, required: true, min: 1 },
    options: { type: [String] },
    answer:  { type: String },
  },
  { _id: false }
);

const SectionSchema = new Schema<ISection>(
  {
    label: { type: String, required: true },
    questions: { type: [QuestionSchema], required: true },
  },
  { _id: false }
);

// ─── Main schema ─────────────────────────────────────────────────────────────

const QuestionPaperSchema = new Schema<IQuestionPaper>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
      index: true,
    },
    sections:   { type: [SectionSchema], required: true },
    totalMarks: { type: Number, required: true },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const QuestionPaper = mongoose.model<IQuestionPaper>(
  'QuestionPaper',
  QuestionPaperSchema
);
