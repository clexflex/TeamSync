import User from "../models/User.js";
import Employee from "../models/Employee.js";
import Manager from "../models/Manager.js";
import Leave from "../models/Leave.js";
import logger from "../utils/logger.js";


const getLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find()
            .populate('userId', 'name email role')
            .sort({ appliedAt: -1 });

        return res.status(200).json({ success: true, leaves });
    } catch (error) {
        logger.error(`Error fetching leaves: ${error.message}`);
        return res.status(500).json({ success: false, error: "Error fetching leaves" });
    }
};

const getLeave = async (req, res) => {
    try {
        const { id, role } = req.params;
        
        // For employees and managers, only show their own leaves
        const query = role === 'admin' ? {} : { userId: id };
        const leaves = await Leave.find(query)
            .populate('userId', 'name email role')
            .sort({ appliedAt: -1 });

        return res.status(200).json({ success: true, leaves });
    } catch (error) {
        logger.error(`Error fetching leave: ${error.message}`);
        return res.status(500).json({ success: false, error: "Error fetching leave" });
    }
};

const getLeaveDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const leave = await Leave.findById(id)
            .populate('userId', 'name email role');

        if (!leave) {
            return res.status(404).json({ success: false, error: "Leave not found" });
        }

        return res.status(200).json({ success: true, leave });
    } catch (error) {
        logger.error(`Error fetching leave detail: ${error.message}`);
        return res.status(500).json({ success: false, error: "Error fetching leave detail" });
    }
};

const updateLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const leave = await Leave.findByIdAndUpdate(
            id,
            { 
                status,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!leave) {
            return res.status(404).json({ success: false, error: "Leave not found" });
        }

        logger.info(`Leave status updated to ${status} for leave ID: ${id}`);
        return res.status(200).json({ success: true, leave });
    } catch (error) {
        logger.error(`Error updating leave: ${error.message}`);
        return res.status(500).json({ success: false, error: "Error updating leave" });
    }
};

const addLeave = async (req, res) => {
    try {
        const { userId, leaveType, startDate, endDate, reason } = req.body;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        const newLeave = new Leave({
            userId,
            leaveType,
            startDate,
            endDate,
            reason
        });

        await newLeave.save();
        
        logger.info(`Leave request added for ${user.role} (ID: ${userId})`);
        return res.status(200).json({ success: true });
    } catch (error) {
        logger.error(`Error adding leave: ${error.message}`);
        return res.status(500).json({ success: false, error: "Leave add server error" });
    }
};


export { addLeave, getLeave, getLeaves, getLeaveDetail, updateLeave };