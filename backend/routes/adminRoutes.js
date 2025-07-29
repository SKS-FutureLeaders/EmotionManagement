import express from 'express';
import adminController from '../controllers/adminController.js';

const router = express.Router();

// User management routes
router.get('/users', adminController.fetch_all_users);
router.get('/user/:identifier', adminController.fetch_user);
router.get('/parent/:email', adminController.fetch_parent_details);
router.get('/child/:email/stats', adminController.fetch_child_stats);
router.delete('/parent/:email', adminController.delete_parent);
router.delete('/child/:email', adminController.delete_child);

// Content management routes
router.post('/upload-content', adminController.upload_content);
router.get('/content', adminController.get_content);
router.get('/content/:contentId', adminController.get_content_details);
router.delete('/content/:contentId', adminController.delete_content);

export default router;
