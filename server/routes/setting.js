import express from "express";
import { verifyUser } from "../middleware/authMiddleware.js";
import { changePassword } from "../controllers/settingController.js";

const router = express.Router();

// All authenticated users can change passwords
router.put("/change-password", verifyUser, changePassword);

export default router;
