import express from 'express';
import { verifyUser, verifyRole } from '../middleware/authMiddleware.js';
import { addEmployee, upload, getEmployees, getEmployee, updateEmployee, fetchEmployeesByDepId } from '../controllers/employeeController.js';

const router = express.Router();
router.get('/', verifyUser, getEmployees);
router.post('/add', verifyUser, upload.single('image'), addEmployee);
router.get('/:id', verifyUser, getEmployee);
router.put('/:id', verifyUser, updateEmployee);
router.get('/department/:id', verifyUser, fetchEmployeesByDepId);
export default router;
