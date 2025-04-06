import express from "express";
import { verifyUser, verifyRole } from "../middleware/authMiddleware.js";
import {
    clockIn,
    clockOut,
    approveAttendance,
    getMyAttendance,
    getTeamAttendance,
    getAttendanceSummary,
    getCurrentStatus,
    getMonthlyAttendance,
    getAllAttendance,
    getAttendanceReports,
    addAttendanceRecord,
    deleteAttendanceRecord,
    getAllAttendanceRecords
} from "../controllers/attendanceController.js";
const router = express.Router();
// Employee routes
router.get("/current-status", verifyUser, verifyRole(["employee", "manager"]), getCurrentStatus);
router.post("/clock-in", verifyUser, verifyRole(["employee", "manager"]), clockIn);
router.post("/clock-out", verifyUser, verifyRole(["employee", "manager"]), clockOut);
router.get("/my-attendance", verifyUser, verifyRole(["employee", "manager"]), getMyAttendance);
// Manager and Admin routes
router.put("/approve", verifyUser, verifyRole(["manager", "admin"]), approveAttendance);
router.get("/team", verifyUser, verifyRole(["manager", "admin"]), getTeamAttendance);
router.get("/summary", verifyUser, verifyRole(["admin"]), getAttendanceSummary);
router.get("/monthly", verifyUser, verifyRole(["employee", "manager"]), getMonthlyAttendance);
router.get("/all", verifyUser, verifyRole(["admin"]), getAllAttendance);
router.get("/reports", verifyUser, verifyRole(["admin"]), getAttendanceReports);

router.post("/add-record", verifyUser, verifyRole(["admin"]), addAttendanceRecord);
router.delete("/delete-record/:attendanceId", verifyUser, verifyRole(["admin"]), deleteAttendanceRecord);
router.get("/records", verifyUser, verifyRole(["admin"]), getAllAttendanceRecords);

export default router;