import express from "express";
import { verifyUser, verifyRole } from "../middleware/authMiddleware.js";
import {
    createNotification,
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
} from "../controllers/notificationController.js";

const router = express.Router();

// User notification routes
router.get("/my-notifications", verifyUser, getMyNotifications);
router.put("/mark-read/:id", verifyUser, markAsRead);
router.put("/mark-all-read", verifyUser, markAllAsRead);
router.delete("/clear", verifyUser, clearAllNotifications);
router.delete("/:id", verifyUser, deleteNotification);

// Admin routes for creating notifications
router.post("/create", verifyUser, verifyRole(["admin"]), createNotification);

export default router;