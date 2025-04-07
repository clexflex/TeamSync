import express from "express";
import { verifyUser, verifyRole } from "../middleware/authMiddleware.js";
import {
    createTicket,
    getAllTickets,
    getTicketById,
    getUserTickets,
    updateTicketStatus,
    deleteTicket,
    addTicketResponse,
    assignTicket,
    uploadTicketAttachment,
    getTicketStats
} from "../controllers/ticketController.js";

const router = express.Router();

// Routes for all authenticated users
router.post("/create", verifyUser, verifyRole(["employee", "manager"]), uploadTicketAttachment, createTicket);
router.get("/my-tickets", verifyUser, verifyRole(["employee", "manager"]), getUserTickets);
router.get("/:id", verifyUser, getTicketById);
router.post("/:id/response", verifyUser, uploadTicketAttachment, addTicketResponse);

// Admin specific routes
router.get("/", verifyUser, verifyRole(["admin"]), getAllTickets);
router.put("/:id/status", verifyUser, verifyRole(["admin"]), updateTicketStatus);
router.put("/:id/assign", verifyUser, verifyRole(["admin"]), assignTicket);
router.delete("/:id", verifyUser, verifyRole(["admin"]), deleteTicket);
router.get("/stats/dashboard", verifyUser, verifyRole(["admin"]), getTicketStats);

export default router;