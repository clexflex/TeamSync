import express from 'express';
import { verifyUser, verifyRole } from '../middleware/authMiddleware.js';
import { addSalary, getSalary } from '../controllers/salaryController.js';

const router = express.Router();

// Admin-only access for salary management
router.post('/add', verifyUser, verifyRole(['admin']), addSalary);
router.get('/:id/:role', verifyUser, getSalary);

export default router;
