import express from 'express';
import { verifyUser } from '../middleware/authMiddleware.js';
import { addManager, upload , getManagers, getAvailableDepartments, getManagerById, updateManager, deleteManager, getManagerTeams } from '../controllers/managerController.js';

const router = express.Router();

router.post('/add', verifyUser, upload.single('image'), addManager);
router.get('/', verifyUser, getManagers);
router.get('/:id', verifyUser, getManagerById);
router.delete('/:id', verifyUser, deleteManager);
router.get('/:id/teams', verifyUser, getManagerTeams);
router.get('/available-departments', verifyUser, getAvailableDepartments);
router.put('/:id', verifyUser, upload.single('image'), updateManager);
export default router;
