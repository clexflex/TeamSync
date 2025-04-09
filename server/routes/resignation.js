import express from 'express';
import { verifyUser, verifyRole } from '../middleware/authMiddleware.js';
import {
    submitResignation,
    getResignationRequests,
    getResignationById,
    getUserResignation,
    updateResignationStatus,
    updateClearanceStatus,
    withdrawResignation
} from '../controllers/resignationController.js';

const router = express.Router();

// Employee/Manager routes
router.post('/submit', verifyUser, verifyRole(['employee', 'manager']), submitResignation);
router.get('/my-status', verifyUser, verifyRole(['employee', 'manager']), getUserResignation);
router.put('/withdraw', verifyUser, verifyRole(['employee', 'manager']), withdrawResignation);

// Admin routes
router.get('/list', verifyUser, verifyRole(['admin']), getResignationRequests);
router.get('/detail/:id', verifyUser, getResignationById);
router.put('/:id/status', verifyUser, verifyRole(['admin']), updateResignationStatus);
router.put('/:id/clearance', verifyUser, verifyRole(['admin']), updateClearanceStatus);

export default router;