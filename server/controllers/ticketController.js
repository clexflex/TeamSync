import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import logger from "../utils/logger.js";
import { uploadFileToFirebase, deleteFileFromFirebase, getFileSignedUrl } from '../config/firebase.js';
import { uploadTicket as firebaseUploader } from '../utils/firebase-multer.js';
import { fileURLToPath } from 'url';
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware for handling file uploads
export const uploadTicketAttachment = firebaseUploader.array('attachments', 5); // Allow up to 5 files

// Create a new ticket
const createTicket = async (req, res) => {
    try {
        const { title, description, type, priority, dueDate } = req.body;
        const userId = req.user._id;

        // Basic validation
        if (!title || !description || !type) {
            return res.status(400).json({ 
                success: false, 
                error: "Title, description and type are required fields" 
            });
        }

        // Process attachments if any
        const attachments = [];
        if (req.files && req.files.length > 0) {
            // Upload each file to Firebase
            for (const file of req.files) {
                try {
                    const fileData = await uploadFileToFirebase(file, 'tickets');
                    attachments.push({
                        filename: fileData.filename,
                        path: fileData.path,
                        url: fileData.url,
                        contentType: file.mimetype,
                        size: file.size
                    });
                } catch (uploadError) {
                    logger.error(`Error uploading ticket attachment: ${uploadError.message}`);
                    // Continue with other files
                }
            }
        }

        const newTicket = new Ticket({
            userId,
            title,
            description,
            type,
            priority: priority || "Medium",
            attachments,
            dueDate: dueDate ? new Date(dueDate) : null
        });

        await newTicket.save();
        logger.info(`Ticket created by user ${userId}: ${title}`);

        return res.status(201).json({
            success: true,
            message: "Ticket created successfully",
            ticket: newTicket
        });
    } catch (error) {
        logger.error(`Error creating ticket: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: "Server error in creating ticket"
        });
    }
};

// Get all tickets (admin only)
const getAllTickets = async (req, res) => {
    try {
        const { status, type, priority, search } = req.query;
        
        // Build query
        const query = {};
        
        if (status) query.status = status;
        if (type) query.type = type;
        if (priority) query.priority = priority;
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const tickets = await Ticket.find(query)
            .populate('userId', 'name email role')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: tickets.length,
            tickets
        });
    } catch (error) {
        logger.error(`Error fetching tickets: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: "Server error in fetching tickets"
        });
    }
};

// Get a specific ticket by ID
const getTicketById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const ticket = await Ticket.findById(id)
            .populate('userId', 'name email role')
            .populate('assignedTo', 'name email')
            .populate('responses.userId', 'name email role');
        
        if (!ticket) {
            return res.status(404).json({
                success: false,
                error: "Ticket not found"
            });
        }

        // Check authorization (admin can view any ticket, users can only view their own)
        if (req.user.role !== 'admin' && ticket.userId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: "You don't have permission to view this ticket"
            });
        }

        // Refresh URLs for attachments if needed
        if (ticket.attachments && ticket.attachments.length > 0) {
            for (let i = 0; i < ticket.attachments.length; i++) {
                try {
                    if (ticket.attachments[i].path) {
                        const newUrl = await getFileSignedUrl(ticket.attachments[i].path, 24 * 60 * 60);
                        if (newUrl) {
                            ticket.attachments[i].url = newUrl;
                        }
                    }
                } catch (error) {
                    logger.error(`Error refreshing URL for attachment: ${error.message}`);
                }
            }
        }

        // Refresh URLs for response attachments if needed
        if (ticket.responses && ticket.responses.length > 0) {
            for (let i = 0; i < ticket.responses.length; i++) {
                if (ticket.responses[i].attachments && ticket.responses[i].attachments.length > 0) {
                    for (let j = 0; j < ticket.responses[i].attachments.length; j++) {
                        try {
                            if (ticket.responses[i].attachments[j].path) {
                                const newUrl = await getFileSignedUrl(ticket.responses[i].attachments[j].path, 24 * 60 * 60);
                                if (newUrl) {
                                    ticket.responses[i].attachments[j].url = newUrl;
                                }
                            }
                        } catch (error) {
                            logger.error(`Error refreshing URL for response attachment: ${error.message}`);
                        }
                    }
                }
            }
        }

        return res.status(200).json({
            success: true,
            ticket
        });
    } catch (error) {
        logger.error(`Error fetching ticket: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: "Server error in fetching ticket"
        });
    }
};

// Get tickets for the current user
const getUserTickets = async (req, res) => {
    try {
        const userId = req.user._id;
        const { status } = req.query;
        
        const query = { userId };
        if (status) query.status = status;
        
        const tickets = await Ticket.find(query)
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });
        
        return res.status(200).json({
            success: true,
            count: tickets.length,
            tickets
        });
    } catch (error) {
        logger.error(`Error fetching user tickets: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: "Server error in fetching user tickets"
        });
    }
};

// Update ticket status
const updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, note } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                error: "Status is required"
            });
        }
        
        const ticket = await Ticket.findById(id);
        
        if (!ticket) {
            return res.status(404).json({
                success: false,
                error: "Ticket not found"
            });
        }
        
        ticket.status = status;
        
        // Update timestamps based on status
        if (status === 'Resolved' && !ticket.resolvedAt) {
            ticket.resolvedAt = new Date();
        } else if (status === 'Closed' && !ticket.closedAt) {
            ticket.closedAt = new Date();
        } else if (status === 'Reopened') {
            ticket.resolvedAt = null;
            ticket.closedAt = null;
        }
        
        // Add a response if note is provided
        if (note) {
            ticket.responses.push({
                userId: req.user._id,
                message: `Status updated to ${status}. ${note}`
            });
        }
        
        await ticket.save();
        logger.info(`Ticket ${id} status updated to ${status} by ${req.user._id}`);
        
        return res.status(200).json({
            success: true,
            message: `Ticket status updated to ${status}`,
            ticket
        });
    } catch (error) {
        logger.error(`Error updating ticket status: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: "Server error in updating ticket status"
        });
    }
};

// Delete a ticket (admin only)
const deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;
        
        const ticket = await Ticket.findById(id);
        
        if (!ticket) {
            return res.status(404).json({
                success: false,
                error: "Ticket not found"
            });
        }
        
        // Delete associated attachments from Firebase
        if (ticket.attachments && ticket.attachments.length > 0) {
            for (const attachment of ticket.attachments) {
                try {
                    if (attachment.path) {
                        await deleteFileFromFirebase(attachment.path);
                    }
                } catch (error) {
                    logger.error(`Error deleting attachment from Firebase: ${error.message}`);
                    // Continue with other attachments
                }
            }
        }
        
        // Delete response attachments from Firebase
        if (ticket.responses) {
            for (const response of ticket.responses) {
                if (response.attachments && response.attachments.length > 0) {
                    for (const attachment of response.attachments) {
                        try {
                            if (attachment.path) {
                                await deleteFileFromFirebase(attachment.path);
                            }
                        } catch (error) {
                            logger.error(`Error deleting response attachment from Firebase: ${error.message}`);
                            // Continue with other attachments
                        }
                    }
                }
            }
        }
        
        await Ticket.findByIdAndDelete(id);
        logger.info(`Ticket ${id} deleted by ${req.user._id}`);
        
        return res.status(200).json({
            success: true,
            message: "Ticket deleted successfully"
        });
    } catch (error) {
        logger.error(`Error deleting ticket: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: "Server error in deleting ticket"
        });
    }
};

// Add a response to a ticket
const addTicketResponse = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                error: "Response message is required"
            });
        }
        
        const ticket = await Ticket.findById(id);
        
        if (!ticket) {
            return res.status(404).json({
                success: false,
                error: "Ticket not found"
            });
        }
        
        // Check authorization (admin can respond to any ticket, users can only respond to their own)
        if (req.user.role !== 'admin' && ticket.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: "You don't have permission to respond to this ticket"
            });
        }
        
        // Process attachments if any
        const attachments = [];
        if (req.files && req.files.length > 0) {
            // Upload each file to Firebase
            for (const file of req.files) {
                try {
                    const fileData = await uploadFileToFirebase(file, 'tickets');
                    attachments.push({
                        filename: fileData.filename,
                        path: fileData.path,
                        url: fileData.url,
                        contentType: file.mimetype,
                        size: file.size
                    });
                } catch (uploadError) {
                    logger.error(`Error uploading response attachment: ${uploadError.message}`);
                    // Continue with other files
                }
            }
        }
        
        const response = {
            userId: req.user._id,
            message,
            attachments,
            timestamp: new Date()
        };
        
        ticket.responses.push(response);
        
        // If an admin responds to an Open ticket, change status to In Progress
        if (req.user.role === 'admin' && ticket.status === 'Open') {
            ticket.status = 'In Progress';
        }
        
        await ticket.save();
        logger.info(`Response added to ticket ${id} by ${req.user._id}`);
        
        // Populate the user details for the response
        const populatedTicket = await Ticket.findById(id)
            .populate('userId', 'name email role')
            .populate('assignedTo', 'name email')
            .populate('responses.userId', 'name email role');
        
        return res.status(200).json({
            success: true,
            message: "Response added successfully",
            ticket: populatedTicket
        });
    } catch (error) {
        logger.error(`Error adding response to ticket: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: "Server error in adding response"
        });
    }
};

// Assign a ticket to an admin user
const assignTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { assignedTo } = req.body;
        
        if (!assignedTo) {
            return res.status(400).json({
                success: false,
                error: "Assignee ID is required"
            });
        }
        
        // Verify the assignee is an admin
        const assignee = await User.findById(assignedTo);
        
        if (!assignee) {
            return res.status(404).json({
                success: false,
                error: "Assignee not found"
            });
        }
        
        if (assignee.role !== 'admin') {
            return res.status(400).json({
                success: false,
                error: "Tickets can only be assigned to admin users"
            });
        }
        
        const ticket = await Ticket.findById(id);
        
        if (!ticket) {
            return res.status(404).json({
                success: false,
                error: "Ticket not found"
            });
        }
        
        ticket.assignedTo = assignedTo;
        
        // Add a response to record the assignment
        ticket.responses.push({
            userId: req.user._id,
            message: `Ticket assigned to ${assignee.name}`
        });
        
        await ticket.save();
        logger.info(`Ticket ${id} assigned to ${assignedTo} by ${req.user._id}`);
        
        return res.status(200).json({
            success: true,
            message: `Ticket assigned to ${assignee.name}`,
            ticket
        });
    } catch (error) {
        logger.error(`Error assigning ticket: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: "Server error in assigning ticket"
        });
    }
};

// Get ticket statistics for admin dashboard
const getTicketStats = async (req, res) => {
    try {
        // Count tickets by status
        const statusCounts = await Ticket.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // Count tickets by type
        const typeCounts = await Ticket.aggregate([
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // Count tickets by priority
        const priorityCounts = await Ticket.aggregate([
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // Count tickets created in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentTicketsCount = await Ticket.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });
        
        // Count unassigned tickets
        const unassignedCount = await Ticket.countDocuments({
            assignedTo: { $exists: false }
        });
        
        // Format status counts into an object
        const statusStats = {};
        statusCounts.forEach(item => {
            statusStats[item._id] = item.count;
        });
        
        // Format type counts into an object
        const typeStats = {};
        typeCounts.forEach(item => {
            typeStats[item._id] = item.count;
        });
        
        // Format priority counts into an object
        const priorityStats = {};
        priorityCounts.forEach(item => {
            priorityStats[item._id] = item.count;
        });
        
        return res.status(200).json({
            success: true,
            stats: {
                statusStats,
                typeStats,
                priorityStats,
                recentTicketsCount,
                unassignedCount,
                totalTickets: await Ticket.countDocuments()
            }
        });
    } catch (error) {
        logger.error(`Error fetching ticket stats: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: "Server error in fetching ticket statistics"
        });
    }
};

export {
    createTicket,
    getAllTickets,
    getTicketById,
    getUserTickets,
    updateTicketStatus,
    deleteTicket,
    addTicketResponse,
    assignTicket,
    getTicketStats
};