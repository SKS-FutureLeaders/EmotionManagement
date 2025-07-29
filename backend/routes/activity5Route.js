import express from 'express';
import { 
    saveCopingSkills, 
    saveSituationResponses, 
    getActivity5Progress 
} from '../controllers/activity5Controller.js';

const router = express.Router();

// Routes for Activity 5 (without authentication middleware)
router.post('/copingskills', saveCopingSkills);
router.post('/responses', saveSituationResponses);
router.get('/progress', getActivity5Progress);

export default router;