"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Assignment = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// ─── Schema ──────────────────────────────────────────────────────────────────
const AssignmentSchema = new mongoose_1.Schema({
    profileId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Profile',
        required: [true, 'Profile is required'],
        index: true,
    },
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
            validator: (arr) => arr.length > 0,
            message: 'At least one question type must be selected',
        },
    },
    questionSpec: {
        type: [
            {
                questionType: {
                    type: String,
                    enum: ['mcq', 'short', 'long', 'true-false'],
                    required: true,
                },
                count: { type: Number, required: true, min: 1 },
                marksPerQuestion: { type: Number, required: true, min: 1 },
            },
        ],
        required: false,
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
}, { timestamps: true });
// Index for fast status-based queries
AssignmentSchema.index({ status: 1, createdAt: -1 });
AssignmentSchema.index({ profileId: 1, createdAt: -1 });
exports.Assignment = mongoose_1.default.model('Assignment', AssignmentSchema);
//# sourceMappingURL=Assignment.js.map