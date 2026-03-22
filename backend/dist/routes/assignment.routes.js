"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const assignment_controller_1 = require("../controllers/assignment.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// ─── Multer config ────────────────────────────────────────────────────────────
const storage = multer_1.default.diskStorage({
    destination: 'uploads/',
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path_1.default.extname(file.originalname)}`);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new Error('Only PDF files are allowed'));
        }
    },
});
// ─── Routes ───────────────────────────────────────────────────────────────────
/**
 * POST   /api/assignments         — Create assignment (+optional PDF)
 * GET    /api/assignments         — List all (paginated)
 * GET    /api/assignments/:id     — Single assignment + status
 * GET    /api/assignments/:id/result — Generated question paper
 */
router.post('/', upload.single('file'), assignment_controller_1.createAssignment);
router.get('/', assignment_controller_1.listAssignments);
router.get('/:id', assignment_controller_1.getAssignment);
router.get('/:id/result', assignment_controller_1.getAssignmentResult);
exports.default = router;
//# sourceMappingURL=assignment.routes.js.map