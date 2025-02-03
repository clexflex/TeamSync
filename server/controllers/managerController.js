import multer from "multer"
import Department from "../models/Department.js"
import User from "../models/User.js"
import Manager from "../models/Manager.js"
import bcrypt from "bcrypt"
import path from "path"

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage })

const addManager = async (req, res) => {
    try {
        const {
            name,
            email,
            managerId,
            department,
            password,
            role,
        } = req.body;

        // Check if user already exists
        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ success: false, error: "User already exists" });
        }

        // Check if department already has a manager
        // const existingManager = await Manager.findOne({ department });
        // if (existingManager) {
        //     return res.status(400).json({ success: false, error: "Department already has a manager" });
        // }

        // Hash password
        const hashPassword = await bcrypt.hash(password, 10)

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashPassword,
            department,
            role: 'manager',
            profileImage: req.file ? req.file.filename : ""
        })
        const savedUser = await newUser.save()

        // Create new manager
        const newManager = new Manager({
            userId: savedUser._id,
            managerId,
            department,
            designation: "Team Manager"
        })

        await newManager.save()
        return res.status(200).json({ success: true, message: "Manager Created Successfully" });
    } catch (error) {
        console.error("Error in addManager:", error);
        console.log("Error in addManager:", error);
        return res.status(500).json({ success: false, error: "Server error in adding manager" });
    }
};



// Fetch departments for the frontend
const getDepartments = async (req, res) => {
    try {
        // Fetch all departments
        const departments = await Department.find({}, "dep_name _id");

        return res.status(200).json({ success: true, departments });
    } catch (error) {
        console.error("Error fetching departments:", error);
        return res.status(500).json({ success: false, error: "Failed to fetch departments." });
    }
};

const getAvailableDepartments = async (req, res) => {
    try {
        // Get all departments
        const allDepartments = await Department.find().select('_id dep_name');
        
        // Get departments that are already assigned to managers
        const assignedDepartments = await Manager.find().select('department');
        
        // Convert assigned departments to array of IDs
        const assignedDepartmentIds = assignedDepartments.map(manager => 
            manager.department.toString()
        );
        
        // Filter out departments that are already assigned
        const availableDepartments = allDepartments.filter(dept => 
            !assignedDepartmentIds.includes(dept._id.toString())
        );

        return res.status(200).json({
            success: true,
            departments: availableDepartments
        });

    } catch (error) {
        console.error("Error in getAvailableDepartments:", error);
        return res.status(500).json({
            success: false,
            error: "Unable to fetch departments"
        });
    }
};

// Simple helper function to check department availability
const isDepartmentAvailable = async (departmentId, excludeManagerId = null) => {
    const query = {
        department: departmentId
    };
    
    // If updating existing manager, exclude their current assignment
    if (excludeManagerId) {
        query._id = { $ne: excludeManagerId };
    }
    
    const existingAssignment = await Manager.findOne(query);
    return !existingAssignment;
};


const updateManager = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Get the manager
        const manager = await Manager.findById(id);
        if (!manager) {
            return res.status(404).json({
                success: false,
                error: "Manager not found"
            });
        }

        // If department is being changed, check if new department already has a manager
        // if (updates.department && updates.department !== manager.department.toString()) {
        //     const existingManager = await Manager.findOne({ 
        //         department: updates.department,
        //         _id: { $ne: id } // Exclude current manager
        //     });
            
        //     if (existingManager) {
        //         return res.status(400).json({
        //             success: false,
        //             error: "Selected department already has a manager"
        //         });
        //     }
        // }

        // Update user information if provided
        if (updates.name || updates.email || updates.password) {
            const userUpdates = {};
            if (updates.name) userUpdates.name = updates.name;
            if (updates.email) userUpdates.email = updates.email;
            if (updates.password) {
                userUpdates.password = await bcrypt.hash(updates.password, 10);
            }
            if (req.file) {
                userUpdates.profileImage = req.file.filename;
            }
            
            await User.findByIdAndUpdate(manager.userId, userUpdates);
        }

        // Update manager information
        const managerUpdates = {};
        if (updates.department) managerUpdates.department = updates.department;
        if (updates.managerId) managerUpdates.managerId = updates.managerId;
        if (updates.designation) managerUpdates.designation = updates.designation;

        await Manager.findByIdAndUpdate(id, managerUpdates);

        return res.status(200).json({
            success: true,
            message: "Manager updated successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Error updating manager"
        });
    }
};


// Get all managers
const getManagers = async (req, res) => {
    try {
        const managers = await Manager.find()
            .populate("userId", "-password")
            .populate("department", "dep_name")
            .populate("teams");

        return res.status(200).json({ success: true, managers });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch managers." });
    }
};

// Get a specific manager by ID
// const getManagerById = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const manager = await Manager.findById(id)
//             .populate("userId", "-password")
//             .populate("department", "dep_name")
//             .populate("teams");

//         if (!manager) {
//             return res.status(404).json({ success: false, error: "Manager not found." });
//         }

//         return res.status(200).json({ success: true, manager });
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({ success: false, error: "Failed to fetch manager." });
//     }
// };

// Update the getManagerById function in your manager controller
const getManagerById = async (req, res) => {
    const { id } = req.params;
    try {
        let manager;
        // First try finding by manager ID
        manager = await Manager.findById(id)
            .populate('userId', '-password')
            .populate('department')
            .populate('teams');

        // If not found, try finding by userId
        if (!manager) {
            manager = await Manager.findOne({ userId: id })
                .populate('userId', '-password')
                .populate('department')
                .populate('teams');
        }

        if (!manager) {
            return res.status(404).json({ success: false, error: "Manager not found." });
        }

        return res.status(200).json({ success: true, manager });
    } catch (error) {
        console.error("Error fetching manager:", error);
        return res.status(500).json({ success: false, error: "Failed to fetch manager." });
    }
};

// Delete a manager
const deleteManager = async (req, res) => {
    try {
        const { id } = req.params;

        const manager = await Manager.findByIdAndDelete(id);

        if (!manager) {
            return res.status(404).json({ success: false, error: "Manager not found." });
        }

        // Update user role back to "employee" if necessary
        await User.findByIdAndUpdate(manager.userId, { role: "employee" });

        return res.status(200).json({ success: true, message: "Manager deleted successfully." });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Failed to delete manager." });
    }
};

// Get teams managed by a specific manager
const getManagerTeams = async (req, res) => {
    try {
        const { id } = req.params;

        const manager = await Manager.findById(id).populate("teams");

        if (!manager) {
            return res.status(404).json({ success: false, error: "Manager not found." });
        }

        return res.status(200).json({ success: true, teams: manager.teams });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch teams." });
    }
};

export {
    addManager, upload ,getAvailableDepartments,
    getManagers,
    getManagerById,
    updateManager,
    deleteManager,
    getManagerTeams,
    getDepartments 
};
