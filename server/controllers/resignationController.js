import ResignationRequest from "../models/ResignationRequest.js";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import Manager from "../models/Manager.js";
import UserProfile from "../models/UserProfile.js";
import logger from "../utils/logger.js";

// Default clearance items that need to be completed before exit
const defaultClearanceItems = [
    { item: "Company Assets (Laptop, ID Card, etc.)", cleared: false },
    { item: "Return of Access Keys/Cards", cleared: false },
    { item: "Knowledge Transfer", cleared: false },
    { item: "Exit Interview", cleared: false },
    { item: "Project Handover", cleared: false },
    { item: "Final Settlement", cleared: false }
];

// Submit a resignation request
export const submitResignation = async (req, res) => {
    try {
        const userId = req.user._id;
        const { reason, noticePeriod, lastWorkingDay } = req.body;
        
        // Validate inputs
        if (!reason || !noticePeriod || !lastWorkingDay) {
            return res.status(400).json({
                success: false,
                error: "Reason, notice period, and last working day are required"
            });
        }
        
        // Check if a pending resignation request already exists
        const existingRequest = await ResignationRequest.findOne({
            userId,
            status: { $in: ["Pending", "Approved"] }
        });
        
        if (existingRequest) {
            return res.status(400).json({
                success: false,
                error: "A pending or approved resignation request already exists for this user"
            });
        }
        
        // Determine if the user is an employee or manager
        let employeeId = null;
        let managerId = null;
        
        if (req.user.role === "employee") {
            const employee = await Employee.findOne({ userId });
            if (employee) {
                employeeId = employee._id;
            }
        } else if (req.user.role === "manager") {
            const manager = await Manager.findOne({ userId });
            if (manager) {
                managerId = manager._id;
            }
        }
        
        // Create new resignation request
        const newRequest = new ResignationRequest({
            userId,
            employeeId,
            managerId,
            reason,
            noticePeriod: parseInt(noticePeriod),
            lastWorkingDay: new Date(lastWorkingDay),
            clearanceItems: defaultClearanceItems
        });
        
        await newRequest.save();
        
        logger.info(`User ${userId} submitted a resignation request`);
        
        return res.status(201).json({
            success: true,
            message: "Resignation request submitted successfully",
            request: newRequest
        });
        
    } catch (error) {
        logger.error(`Error submitting resignation request: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in submitting resignation request: ${error.message}`
        });
    }
};

// Get all resignation requests (admin only)
export const getResignationRequests = async (req, res) => {
    try {
        const { status } = req.query;
        
        const query = {};
        if (status && status !== "All") {
            query.status = status;
        }
        
        const requests = await ResignationRequest.find(query)
            .populate("userId", "name email role")
            .populate("processedBy", "name")
            .sort({ submissionDate: -1 });
        
        return res.status(200).json({
            success: true,
            count: requests.length,
            requests
        });
        
    } catch (error) {
        logger.error(`Error fetching resignation requests: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in fetching resignation requests: ${error.message}`
        });
    }
};

// Get a specific resignation request
export const getResignationById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const request = await ResignationRequest.findById(id)
            .populate("userId", "name email role")
            .populate("processedBy", "name")
            .populate("clearanceItems.clearedBy", "name");
        
        if (!request) {
            return res.status(404).json({
                success: false,
                error: "Resignation request not found"
            });
        }
        
        // Check access rights - admin can view any, users can only view their own
        if (req.user.role !== "admin" && request.userId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: "Unauthorized access"
            });
        }
        
        // Get additional user details
        let employee = null;
        let manager = null;
        let departmentInfo = null;
        let userProfile = null;
        
        if (request.employeeId) {
            employee = await Employee.findById(request.employeeId)
                .populate("department", "dep_name");
            if (employee) {
                departmentInfo = employee.department;
            }
        } else if (request.managerId) {
            manager = await Manager.findById(request.managerId)
                .populate("department", "dep_name");
            if (manager) {
                departmentInfo = manager.department;
            }
        }
        
        userProfile = await UserProfile.findOne({ userId: request.userId._id });
        
        return res.status(200).json({
            success: true,
            request,
            employee,
            manager,
            departmentInfo,
            userProfile
        });
        
    } catch (error) {
        logger.error(`Error fetching resignation request: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in fetching resignation request: ${error.message}`
        });
    }
};

// Get user's own resignation status
export const getUserResignation = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const request = await ResignationRequest.findOne({ 
            userId 
        })
        .sort({ submissionDate: -1 })
        .populate("processedBy", "name");
        
        return res.status(200).json({
            success: true,
            request
        });
        
    } catch (error) {
        logger.error(`Error fetching user resignation: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in fetching user resignation: ${error.message}`
        });
    }
};

// Update resignation status (admin only)
export const updateResignationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                error: "Status is required"
            });
        }
        
        if (status === "Rejected" && !adminNotes) {
            return res.status(400).json({
                success: false,
                error: "Notes are required when rejecting a resignation"
            });
        }
        
        const request = await ResignationRequest.findById(id);
        
        if (!request) {
            return res.status(404).json({
                success: false,
                error: "Resignation request not found"
            });
        }
        
        // Update resignation status
        request.status = status;
        request.adminNotes = adminNotes || request.adminNotes;
        request.processedBy = req.user._id;
        request.processedDate = new Date();
        
        // If approved, check if all clearance items are completed
        if (status === "Approved") {
            const allCleared = request.clearanceItems.every(item => item.cleared);
            
            if (!allCleared) {
                return res.status(400).json({
                    success: false,
                    error: "Cannot approve resignation until all clearance items are completed"
                });
            }
            
            // Update user status to inactive
            await User.findByIdAndUpdate(request.userId, { status: "inactive" });
        }
        
        await request.save();
        
        logger.info(`Resignation request ${id} status updated to ${status} by admin ${req.user._id}`);
        
        return res.status(200).json({
            success: true,
            message: `Resignation request ${status.toLowerCase()} successfully`,
            request
        });
        
    } catch (error) {
        logger.error(`Error updating resignation status: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in updating resignation status: ${error.message}`
        });
    }
};

// Update clearance items (admin only)
export const updateClearanceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { clearanceItems } = req.body;
        
        if (!clearanceItems || !Array.isArray(clearanceItems)) {
            return res.status(400).json({
                success: false,
                error: "Valid clearance items are required"
            });
        }
        
        const request = await ResignationRequest.findById(id);
        
        if (!request) {
            return res.status(404).json({
                success: false,
                error: "Resignation request not found"
            });
        }
        
        // Update each clearance item
        for (const updatedItem of clearanceItems) {
            const itemIndex = request.clearanceItems.findIndex(
                item => item._id.toString() === updatedItem.id
            );
            
            if (itemIndex >= 0) {
                request.clearanceItems[itemIndex].cleared = updatedItem.cleared;
                request.clearanceItems[itemIndex].notes = updatedItem.notes;
                
                if (updatedItem.cleared) {
                    request.clearanceItems[itemIndex].clearedDate = new Date();
                    request.clearanceItems[itemIndex].clearedBy = req.user._id;
                } else {
                    request.clearanceItems[itemIndex].clearedDate = null;
                    request.clearanceItems[itemIndex].clearedBy = null;
                }
            }
        }
        
        await request.save();
        
        logger.info(`Clearance items updated for resignation request ${id} by admin ${req.user._id}`);
        
        return res.status(200).json({
            success: true,
            message: "Clearance items updated successfully",
            request
        });
        
    } catch (error) {
        logger.error(`Error updating clearance items: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in updating clearance items: ${error.message}`
        });
    }
};

// Withdraw a resignation request (employee/manager only)
export const withdrawResignation = async (req, res) => {
    try {
        const userId = req.user._id;
        const { withdrawalReason } = req.body;
        
        if (!withdrawalReason) {
            return res.status(400).json({
                success: false,
                error: "Reason for withdrawal is required"
            });
        }
        
        const request = await ResignationRequest.findOne({
            userId,
            status: "Pending"
        });
        
        if (!request) {
            return res.status(404).json({
                success: false,
                error: "No pending resignation request found"
            });
        }
        
        request.status = "Withdrawn";
        request.withdrawalReason = withdrawalReason;
        
        await request.save();
        
        logger.info(`User ${userId} withdrew their resignation request`);
        
        return res.status(200).json({
            success: true,
            message: "Resignation request withdrawn successfully",
            request
        });
        
    } catch (error) {
        logger.error(`Error withdrawing resignation: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in withdrawing resignation: ${error.message}`
        });
    }
};