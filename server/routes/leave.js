// import express from 'express';
// import { verifyUser, verifyRole } from '../middleware/authMiddleware.js';
// import { addLeave, getLeave, getLeaves, getLeaveDetail, updateLeave } from '../controllers/leaveController.js';

// const router = express.Router();

// // Admin access for managing all leaves
// router.get('/', verifyUser, verifyRole(['admin']), getLeaves);
// router.get('/detail/:id', verifyUser, verifyRole(['admin']), getLeaveDetail);

// // Employees and managers can view their own leaves
// router.get('/:id/:role', verifyUser, verifyRole(['admin', 'employee', 'manager']), getLeave);

// // Both admins, employees and managers can add leaves
// router.post('/add', verifyUser, verifyRole(['admin', 'employee', 'manager']), addLeave);

// // Admins can update leave status
// router.put('/:id', verifyUser, verifyRole(['admin']), updateLeave);

// export default router;
import express from 'express';
import { verifyUser, verifyRole } from '../middleware/authMiddleware.js';
import {
    // Leave Policy Controllers
    createLeavePolicy,
    updateLeavePolicy,
    getLeavePolicies,
    getLeavePolicyById,
    assignLeavePolicy,
    
    // Leave Balance Controllers
    getUserLeaveBalance,
    updateLeaveBalance,
    resetLeaveBalances,
    
    // Enhanced Leave Controllers
    addLeave,
    updateLeave,
    getLeaves,
    getLeave,
    getLeaveDetail,
    approveLeave,
    rejectLeave,
    cancelLeave,
    uploadLeaveDocument
} from '../controllers/leaveController.js';

const router = express.Router();

// Leave Policy Routes (Admin only)
router.post('/policy/create', verifyUser, verifyRole(['admin']), createLeavePolicy);
router.put('/policy/:id', verifyUser, verifyRole(['admin']), updateLeavePolicy);
router.get('/policy', verifyUser, verifyRole(['admin']), getLeavePolicies);
router.get('/policy/:id', verifyUser, verifyRole(['admin']), getLeavePolicyById);
router.post('/policy/assign', verifyUser, verifyRole(['admin']), assignLeavePolicy);

// Leave Balance Routes
router.get('/balance/:userId', verifyUser, verifyRole(['admin', 'employee', 'manager']), getUserLeaveBalance);
router.put('/balance/:userId', verifyUser, verifyRole(['admin']), updateLeaveBalance);
router.post('/balance/reset', verifyUser, verifyRole(['admin']), resetLeaveBalances);

// Leave Management Routes
router.get('/', verifyUser, verifyRole(['admin']), getLeaves);
router.get('/detail/:id', verifyUser, getLeaveDetail);
router.post('/add', verifyUser, verifyRole(['employee', 'manager']), uploadLeaveDocument, addLeave);
router.put('/:id', verifyUser, verifyRole(['admin']), updateLeave);
router.get('/:id/:role', verifyUser, verifyRole(['admin', 'employee', 'manager']), getLeave);
router.post('/:id/approve', verifyUser, verifyRole(['admin']), approveLeave);
router.post('/:id/reject', verifyUser, verifyRole(['admin']), rejectLeave);
router.post('/:id/cancel', verifyUser, verifyRole(['admin', 'employee', 'manager']), cancelLeave);

export default router;