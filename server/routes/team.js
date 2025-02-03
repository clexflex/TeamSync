import express from "express";
import { verifyUser, verifyRole } from "../middleware/authMiddleware.js";
import {
    createTeam,
    getTeams,
    getTeamById,
    updateTeam,
    deleteTeam,
    getTeamMembers,
    getManagerTeams,
    addTeamMember,
    removeTeamMember,
} from "../controllers/teamController.js";

const router = express.Router();

// Base team routes
router.post("/create", verifyUser, verifyRole(["manager", "admin"]), createTeam);
router.get("/", verifyUser, getTeams);
router.get("/manager/:managerId", verifyUser, verifyRole(["manager", "admin"]), getManagerTeams);
router.get("/:id", verifyUser, getTeamById);
router.put("/:id", verifyUser, verifyRole(["manager", "admin"]), updateTeam);
router.delete("/:id", verifyUser, verifyRole(["admin"]), deleteTeam);

// Team member management
router.get("/:id/members", verifyUser, getTeamMembers);
router.post("/:id/members", verifyUser, verifyRole(["manager", "admin"]), addTeamMember);
router.delete("/:id/members/:employeeId", verifyUser, verifyRole(["manager", "admin"]), removeTeamMember);

export default router;