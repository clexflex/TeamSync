import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { addLeave, getLeaves} from '../controllers/leaveController.js'

const router = express.Router()

router.get('/:id', authMiddleware, getLeaves )
router.post('/add', authMiddleware, addLeave )

export default router