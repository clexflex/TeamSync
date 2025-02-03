// server/routes/holiday.js
import express from "express";
import { verifyUser, verifyRole } from "../middleware/authMiddleware.js";
import {
    addHoliday,
    updateHoliday,
    deleteHoliday,
    getHolidays,
    getHoliday,
} from "../controllers/holidayController.js";

const router = express.Router();

// Routes for holiday management
router.post("/add", verifyUser, verifyRole(["admin"]), addHoliday);
router.put("/update/:id", verifyUser, verifyRole(["admin"]), updateHoliday);
router.delete("/delete/:id", verifyUser, verifyRole(["admin"]), deleteHoliday);
router.get("/", verifyUser, verifyRole(["admin"]), getHolidays);
router.get("/:id", verifyUser, verifyRole(["admin"]), getHoliday);

export default router;
