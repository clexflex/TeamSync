import express from 'express';
import { verifyUser, verifyRole } from '../middleware/authMiddleware.js';
import { addDepartment, getDepartments, getDepartment, updateDepartment, deleteDepartment } from '../controllers/departmentController.js';

const router = express.Router();

// Only admins can access department routes
router.get('/', verifyUser, getDepartments);
router.post('/add', verifyUser, verifyRole(['admin']), addDepartment);
router.get('/:id', verifyUser, getDepartment);
router.put('/:id', verifyUser, verifyRole(['admin']), updateDepartment);
router.delete('/:id', verifyUser, verifyRole(['admin']), deleteDepartment);

export default router;
