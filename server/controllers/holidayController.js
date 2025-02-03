// server/controllers/holidayController.js
import Holiday from "../models/Holiday.js";
import Department from "../models/Department.js";

// Add a new holiday
export const addHoliday = async (req, res) => {
    try {
        const { name, date, isCompanyWide, applicableDepartments, description } = req.body;

        // Validate input
        if (!name || !date) {
            return res.status(400).json({ success: false, error: "Name and date are required." });
        }

        if (!isCompanyWide && (!applicableDepartments || applicableDepartments.length === 0)) {
            return res.status(400).json({ success: false, error: "Applicable departments must be specified for department-specific holidays." });
        }

        // Validate departments
        if (!isCompanyWide) {
            const departments = await Department.find({ _id: { $in: applicableDepartments } });
            if (departments.length !== applicableDepartments.length) {
                return res.status(400).json({ success: false, error: "Invalid departments specified." });
            }
        }

        const newHoliday = new Holiday({
            name,
            date,
            isCompanyWide,
            applicableDepartments: isCompanyWide ? [] : applicableDepartments,
            description,
            createdBy: req.user._id,
        });

        await newHoliday.save();
        return res.status(201).json({ success: true, holiday: newHoliday });
    } catch (error) {
        console.error("Error adding holiday:", error);
        return res.status(500).json({ success: false, error: "Failed to add holiday." });
    }
};


// Update a holiday
export const updateHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, date, isCompanyWide, applicableDepartments, description } = req.body;

        const holiday = await Holiday.findById(id);
        if (!holiday) {
            return res.status(404).json({ success: false, error: "Holiday not found." });
        }

        holiday.name = name || holiday.name;
        holiday.date = date || holiday.date;
        holiday.isCompanyWide = isCompanyWide !== undefined ? isCompanyWide : holiday.isCompanyWide;
        holiday.applicableDepartments = isCompanyWide ? [] : applicableDepartments || holiday.applicableDepartments;
        holiday.description = description || holiday.description;

        await holiday.save();
        return res.status(200).json({ success: true, holiday });
    } catch (error) {
        console.error("Error updating holiday:", error);
        return res.status(500).json({ success: false, error: "Failed to update holiday." });
    }
};

// Delete a holiday
export const deleteHoliday = async (req, res) => {
    try {
        const { id } = req.params;

        const holiday = await Holiday.findById(id);
        if (!holiday) {
            return res.status(404).json({ success: false, error: "Holiday not found." });
        }

        await holiday.deleteOne();
        return res.status(200).json({ success: true, message: "Holiday deleted successfully." });
    } catch (error) {
        console.error("Error deleting holiday:", error);
        return res.status(500).json({ success: false, error: "Failed to delete holiday." });
    }
};

// Fetch all holidays
export const getHolidays = async (req, res) => {
    try {
        const holidays = await Holiday.find()
            .populate("applicableDepartments", "dep_name") // Populate department names
            .populate("createdBy", "name"); // Populate admin name

        return res.status(200).json({ success: true, holidays });
    } catch (error) {
        console.error("Error fetching holidays:", error);
        return res.status(500).json({ success: false, error: "Failed to fetch holidays." });
    }
};

// Fetch a specific holiday
export const getHoliday = async (req, res) => {
    try {
        const { id } = req.params;

        const holiday = await Holiday.findById(id)
            .populate("applicableDepartments", "dep_name")
            .populate("createdBy", "name");

        if (!holiday) {
            return res.status(404).json({ success: false, error: "Holiday not found." });
        }

        return res.status(200).json({ success: true, holiday });
    } catch (error) {
        console.error("Error fetching holiday:", error);
        return res.status(500).json({ success: false, error: "Failed to fetch holiday." });
    }
};
