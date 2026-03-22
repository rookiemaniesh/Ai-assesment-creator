import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  createAssignment,
  listAssignments,
  getAssignment,
  getAssignmentResult,
} from '../controllers/assignment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// ─── Multer config ────────────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
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
router.post('/', upload.single('file'), createAssignment);
router.get('/', listAssignments);
router.get('/:id', getAssignment);
router.get('/:id/result', getAssignmentResult);

export default router;
