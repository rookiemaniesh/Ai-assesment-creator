import mongoose, { Document, Types } from 'mongoose';
import type { QuestionType, Difficulty } from './Assignment';
export interface IQuestion {
    number: number;
    text: string;
    type: QuestionType;
    difficulty: Exclude<Difficulty, 'mixed'>;
    marks: number;
    options?: string[];
    answer?: string;
}
export interface ISection {
    label: string;
    questions: IQuestion[];
}
export interface IQuestionPaper extends Document {
    /** Same as owning assignment — denormalized for queries */
    profileId: Types.ObjectId;
    assignmentId: Types.ObjectId;
    sections: ISection[];
    totalMarks: number;
    generatedAt: Date;
}
export declare const QuestionPaper: mongoose.Model<IQuestionPaper, {}, {}, {}, mongoose.Document<unknown, {}, IQuestionPaper, {}, mongoose.DefaultSchemaOptions> & IQuestionPaper & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IQuestionPaper>;
//# sourceMappingURL=QuestionPaper.d.ts.map