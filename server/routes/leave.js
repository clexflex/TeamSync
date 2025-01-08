import express from 'express';
import { verifyUser, verifyRole } from '../middleware/authMiddleware.js';
import { addLeave, getLeave, getLeaves, getLeaveDetail, updateLeave } from '../controllers/leaveController.js';

const router = express.Router();

// Admin access for managing all leaves
router.get('/', verifyUser, verifyRole(['admin']), getLeaves);
router.get('/detail/:id', verifyUser, verifyRole(['admin']), getLeaveDetail);

// Employees can view their own leaves
router.get('/:id/:role', verifyUser, verifyRole(['admin', 'employee']), getLeave);

// Both admins and employees can add leaves
router.post('/add', verifyUser, verifyRole(['admin', 'employee']), addLeave);

// Admins can update leave status
router.put('/:id', verifyUser, verifyRole(['admin']), updateLeave);

export default router;
