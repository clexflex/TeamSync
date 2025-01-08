import express from "express";
import { login, verify } from "../controllers/authController.js";
import { verifyUser, verifyRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public login route
router.post('/login', login);

// Verify route accessible only to authenticated users
router.get('/verify', verifyUser, verify);

export default router;
