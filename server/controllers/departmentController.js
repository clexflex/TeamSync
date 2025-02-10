import Department from "../models/Department.js";
import logger from "../utils/logger.js"; 

const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find()
        logger.info("Fetched all departments successfully.");
        return res.status(200).json({ success: true, departments })
    } catch (error) {
        logger.error("Error fetching departments: " + error.message);
        return res.status(500).json({ success: false, error: "fetch department server error" })
    }
}

const addDepartment = async (req, res) => {
    try {
        const { dep_name, description } = req.body;
        const newDep = new Department({
            dep_name,
            description 
        })
        await newDep.save()
        logger.info(`Department ${dep_name} added successfully.`);
        return res.status(200).json({ success: true, department: newDep })
    } catch (error) {
        logger.error(`Error adding department ${dep_name}: ${error.message}`);
        console.log(error)
        return res.status(500).json({ success: false, error: "add department server error" })
    }
}
const getDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const department = await Department.findById({ _id: id })
        logger.info(`Fetched department with ID ${id}.`);
        return res.status(200).json({ success: true, department })
    } catch (error) {
        console.log(error)
        logger.error(`Error fetching department with ID ${id}: ${error.message}`);
        return res.status(500).json({ success: false, error: "get department server error" })
    }
}
const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { dep_name, description } = req.body;
        const updateDep = await Department.findByIdAndUpdate({ _id: id }, {
            dep_name,
            description
        }
        )
        logger.info(`Updated department ${id} successfully.`);
        return res.status(200).json({ success: true, updateDep })
    } catch (error) {
        logger.error(`Error updating department ${id}: ${error.message}`);
        console.log(error)
        return res.status(500).json({ success: false, error: "update department server error" })
    } 
}

const deleteDepartment = async (req, res) => {
    try {
        const {id} = req.params;
        const deleteDep = await Department.findById({_id: id})
        await deleteDep.deleteOne()
        logger.info(`Deleting department with ID ${id}.`);
        return res.status(200).json({ success: true, deleteDep })
    } catch (error) {
        logger.error(`Error deleting department with ID ${id}: ${error.message}`);
        console.log(error)
        return res.status(500).json({ success: false, error: "Delete department server error" })
    } 
}

export { addDepartment, getDepartments, getDepartment, updateDepartment, deleteDepartment}