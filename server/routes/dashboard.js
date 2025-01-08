import express from 'express';
import { verifyUser, verifyRole } from '../middleware/authMiddleware.js';
import { getSummary } from '../controllers/dashboardController.js';

const router = express.Router();

// Admin-only access for summary
router.get('/summary', verifyUser, verifyRole(['admin']), getSummary);

export default router;
