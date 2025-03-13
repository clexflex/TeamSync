import express from "express";
import { verifyUser, verifyRole } from "../middleware/authMiddleware.js";
import {     createUserProfile,     getUserProfiles,     getUserProfileById,     updateUserProfile,     deleteUserProfile,     upload } from "../controllers/userProfileController.js";
const router = express.Router();

router.post("/create", verifyUser, verifyRole(["admin"]), upload.single("image"), createUserProfile);
router.get("/", verifyUser, verifyRole(["admin"]), getUserProfiles);
router.delete("/:id", verifyUser, verifyRole(["admin"]), deleteUserProfile);
router.put("/:id", verifyUser, verifyRole(["admin"]), upload.single("image"), updateUserProfile);
// Routes accessible by admin, employee, or manager
router.get("/:id", verifyUser, verifyRole(["admin", "employee", "manager"]), getUserProfileById);

export default router;