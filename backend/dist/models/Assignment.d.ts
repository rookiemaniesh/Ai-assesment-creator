import mongoose, { Document, Types } from 'mongoose';
export type QuestionType = 'mcq' | 'short' | 'long' | 'true-false';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';
export type AssignmentStatus = 'pending' | 'processing' | 'completed' | 'failed';
/** Per-row breakdown from the create form (counts and marks each) — drives AI generation. */
export interface QuestionSpecEntry {
    questionType: QuestionType;
    count: number;
    marksPerQuestion: number;
}
export interface IAssignment extends Document {
    /** Owner profile (teacher / school account) */
    profileId: Types.ObjectId;
    title: string;
    subject: string;
    dueDate: Date;
    totalMarks: number;
    numQuestions: number;
    questionTypes: QuestionType[];
    /** When set, the AI must follow these counts and marks per question exactly. */
    questionSpec?: QuestionSpecEntry[];
    difficulty: Difficulty;
    additionalInstructions?: string;
    fileUrl?: string;
    fileText?: string;
    status: AssignmentStatus;
    jobId?: string;
    errorMessage?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Assignment: mongoose.Model<IAssignment, {}, {}, {}, mongoose.Document<unknown, {}, IAssignment, {}, mongoose.DefaultSchemaOptions> & IAssignment & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAssignment>;
//# sourceMappingURL=Assignment.d.ts.map