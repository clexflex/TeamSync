import express from "express";
import { verifyUser, verifyRole } from "../middleware/authMiddleware.js";
import {    
    toggleUserCanEditProfile, 
    updateMyProfile ,  
    createUserProfile,
    bulkDeleteUserProfiles,
    changeUserRole,     
    getUserProfiles,     
    getUserProfileById,     
    updateUserProfile,     
    deleteUserProfile,     
    upload 
} from "../controllers/userProfileController.js";

const router = express.Router();

// More specific routes should come BEFORE parameterized routes
router.put("/my-profile", verifyUser, verifyRole(["employee", "manager"]), updateMyProfile);
router.post("/bulk-delete", verifyUser, verifyRole(["admin"]), bulkDeleteUserProfiles);
router.post("/create", verifyUser, verifyRole(["admin"]), upload.single("image"), createUserProfile);
router.get("/", verifyUser, verifyRole(["admin"]), getUserProfiles);
router.put("/:id/change-role", verifyUser, verifyRole(["admin"]), changeUserRole);
router.delete("/:id", verifyUser, verifyRole(["admin"]), deleteUserProfile);
router.put("/:id", verifyUser, verifyRole(["admin"]), upload.single("image"), updateUserProfile);
router.get("/:id", verifyUser, verifyRole(["admin", "employee", "manager"]), getUserProfileById);
router.put("/:id/toggle-edit-permission", verifyUser, verifyRole(["admin"]), toggleUserCanEditProfile);

export default router;