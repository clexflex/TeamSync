import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { addLeave, getLeave , getLeaves, getLeaveDetail, updateLeave} from '../controllers/leaveController.js'

const router = express.Router()
router.get('/', authMiddleware, getLeaves)
router.get('/detail/:id', authMiddleware, getLeaveDetail )
router.get('/:id/:role', authMiddleware, getLeave )
router.post('/add', authMiddleware, addLeave )
router.put('/:id', authMiddleware, updateLeave )

export default router