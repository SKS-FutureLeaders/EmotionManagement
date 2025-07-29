import express from 'express';
import { 
    getValueProgress, 
    updateProgress, 
    getAllProgress 
} from '../controllers/curriculumController.js';

const router = express.Router();

// Routes for curriculum progress (without auth protection for now)
router.get('/progress/:value', getValueProgress);
router.post('/progress/:value', updateProgress);
router.get('/progress', getAllProgress);

export default router;