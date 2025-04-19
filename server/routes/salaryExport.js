import express from 'express';
import { verifyUser, verifyRole } from '../middleware/authMiddleware.js';
import { exportSalaryData, getCompanyList } from '../controllers/salaryExportController.js';

const router = express.Router();

// Routes for salary export - admin only
router.post('/export', verifyUser, verifyRole(['admin']), exportSalaryData);
router.get('/companies', verifyUser, verifyRole(['admin']), getCompanyList);

export default router;