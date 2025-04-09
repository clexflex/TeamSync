import express from 'express';
import { verifyUser, verifyRole } from '../middleware/authMiddleware.js';
import {      generateSalaryDraft,     generateAllSalaryDrafts, regenerateSalaryDraft, bulkApproveSalaries ,bulkRejectSalaries,  convertToDraft,   getSalaries,     getSalaryById,     getUserSalaryHistory,     updateSalary,     approveSalary,     rejectSalary,     markSalaryAsPaid,     generatePayslip,     downloadPayslip,     getSalaryStats } from '../controllers/salaryController.js';

const router = express.Router();

// Admin-only routes
router.post('/generate', verifyUser, verifyRole(['admin']), generateSalaryDraft);
router.post('/generate-all', verifyUser, verifyRole(['admin']), generateAllSalaryDrafts);
router.get('/list', verifyUser, verifyRole(['admin']), getSalaries);
router.get('/stats', verifyUser, verifyRole(['admin']), getSalaryStats);
router.put('/:id', verifyUser, verifyRole(['admin']), updateSalary);
router.post('/:id/approve', verifyUser, verifyRole(['admin']), approveSalary);
router.post('/:id/reject', verifyUser, verifyRole(['admin']), rejectSalary);
router.post('/:id/pay', verifyUser, verifyRole(['admin']), markSalaryAsPaid);
router.post('/:id/payslip', verifyUser, verifyRole(['admin']), generatePayslip);
router.post('/:id/regenerate', verifyUser, verifyRole(['admin']), regenerateSalaryDraft);
router.post('/:id/convert-to-draft', verifyUser, verifyRole(['admin']), convertToDraft);
router.post('/bulk/approve', verifyUser, verifyRole(['admin']), bulkApproveSalaries);
router.post('/bulk/reject', verifyUser, verifyRole(['admin']), bulkRejectSalaries);
// Routes accessible by admin, employee, and manager
router.get('/detail/:id', verifyUser, getSalaryById);
router.get('/history/:userId', verifyUser, getUserSalaryHistory);
router.get('/payslip/:id', verifyUser, downloadPayslip);

export default router;