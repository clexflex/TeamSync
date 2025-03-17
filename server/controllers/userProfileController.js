import User from "../models/User.js";
import Employee from "../models/Employee.js";
import Manager from "../models/Manager.js";
import UserProfile from "../models/UserProfile.js";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";
import logger from "../utils/logger.js";

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'public/uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Only image files are allowed!"));
    }
});

// Helper to create default leave balances
const createDefaultLeaveBalances = () => {
    return [
        { leaveType: "Casual Leave", balance: 0, used: 0, carryForward: 0 },
        { leaveType: "Sick Leave", balance: 0, used: 0, carryForward: 0 },
        { leaveType: "Paid Leave", balance: 0, used: 0, carryForward: 0 },
        { leaveType: "Half Leave", balance: 0, used: 0, carryForward: 0 }
    ];
};

// Create a new user profile
const createUserProfile = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            joiningDate,
            userType, // "employee" or "manager"
            employeeId, // used for both employeeId and managerId
            department,
            designation,
            gender,
            dob,
            maritalStatus,
            salary,
            leavePolicy, // optional
            status = "active" // default to active
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, error: "User with this email already exists" });
        }

        // Determine the role based on userType
        const role = userType.toLowerCase();
        if (!["employee", "manager"].includes(role)) {
            return res.status(400).json({ success: false, error: "Invalid user type specified" });
        }

        // Hash password
        const hashPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashPassword,
            role,
            status,
            profileImage: req.file ? req.file.filename : ""
        });
        const savedUser = await newUser.save();

        // Create user profile
        const newUserProfile = new UserProfile({
            userId: savedUser._id,
            leavePolicy: leavePolicy || null,
            leaveBalances: createDefaultLeaveBalances(),
            joiningDate: joiningDate || new Date(),
            lastLeaveBalanceReset: null
        });
        const savedUserProfile = await newUserProfile.save();

        // Create either employee or manager based on userType
        if (role === "employee") {
            const newEmployee = new Employee({
                userId: savedUser._id,
                employeeId,
                department,
                designation,
                dob,
                gender,
                maritalStatus,
                salary
            });
            await newEmployee.save();
            logger.info(`Employee ${name} (ID: ${employeeId}) added successfully.`);
        } else if (role === "manager") {
            const newManager = new Manager({
                userId: savedUser._id,
                managerId: employeeId, // using employeeId field for managerId
                department,
                designation: designation || "Team Manager"
            });
            await newManager.save();
            logger.info(`Manager ${name} (ID: ${employeeId}) added successfully.`);
        }

        return res.status(201).json({
            success: true,
            message: `${role.charAt(0).toUpperCase() + role.slice(1)} profile created successfully`,
            userProfileId: savedUserProfile._id
        });
    } catch (error) {
        logger.error(`Error creating user profile: ${error.message}`);
        return res.status(500).json({ success: false, error: "Server error in creating user profile" });
    }
};

// Get all user profiles (admin only)
const getUserProfiles = async (req, res) => {
    try {
        const userProfiles = await UserProfile.find()
            .populate({
                path: 'userId',
                select: 'name email role status profileImage'
            })
            .populate('leavePolicy', 'name'); // Add this line to populate leave policy details

        // Enhance user profiles with employee or manager data
        const enhancedProfiles = await Promise.all(userProfiles.map(async (profile) => {
            const user = profile.userId;
            if (!user) return null;

            let additionalData = {};
            if (user.role === 'employee') {
                const employee = await Employee.findOne({ userId: user._id })
                    .populate('department', 'dep_name');
                if (employee) {
                    additionalData = {
                        employeeId: employee.employeeId,
                        department: employee.department,
                        designation: employee.designation,
                        salary: employee.salary
                    };
                }
            } else if (user.role === 'manager') {
                const manager = await Manager.findOne({ userId: user._id })
                    .populate('department', 'dep_name');
                if (manager) {
                    additionalData = {
                        managerId: manager.managerId,
                        department: manager.department,
                        designation: manager.designation
                    };
                }
            }

            return {
                _id: profile._id,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    profileImage: user.profileImage
                },
                ...additionalData,
                hasLeavePolicy: !!profile.leavePolicy, // Add boolean flag to indicate if user has a policy
                leavePolicyId: profile.leavePolicy?._id || null, // Include the policy ID if available
                leavePolicyName: profile.leavePolicy?.name || null, // Include the policy name if available
                joiningDate: profile.joiningDate,
                leaveBalances: profile.leaveBalances,
                createdAt: profile.createdAt
            };
        }));

        // Filter out null profiles (in case some references were broken)
        const validProfiles = enhancedProfiles.filter(profile => profile !== null);

        return res.status(200).json({
            success: true,
            userProfiles: validProfiles
        });
    } catch (error) {
        logger.error(`Error fetching user profiles: ${error.message}`);
        return res.status(500).json({ success: false, error: "Server error in fetching user profiles" });
    }
};

// Get a specific user profile by ID
const getUserProfileById = async (req, res) => {
    try {
        const { id } = req.params;

        // First, determine if we're looking for a UserProfile ID or a User ID
        let userProfile;
        
        // Try to find by UserProfile ID first
        userProfile = await UserProfile.findById(id);
        
        // If not found, try to find by User ID
        if (!userProfile) {
            userProfile = await UserProfile.findOne({ userId: id });
        }

        // Still not found, return 404
        if (!userProfile) {
            return res.status(404).json({ success: false, error: "User profile not found" });
        }

        // Check access rights - admin can view any profile, users can only view their own
        if (req.user.role !== 'admin') {
            if (userProfile.userId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ success: false, error: "Access denied. You can only view your own profile" });
            }
        }

        // Populate user details
        await userProfile.populate({
            path: 'userId',
            select: 'name email role status profileImage'
        });

        const user = userProfile.userId;
        let additionalData = {};

        if (user.role === 'employee') {
            const employee = await Employee.findOne({ userId: user._id })
                .populate('department', 'dep_name');
            if (employee) {
                additionalData = {
                    employeeId: employee.employeeId,
                    department: employee.department,
                    designation: employee.designation,
                    dob: employee.dob,
                    gender: employee.gender,
                    maritalStatus: employee.maritalStatus,
                    salary: employee.salary,
                    teamId: employee.teamId,
                    managerId: employee.managerId
                };
            }
        } else if (user.role === 'manager') {
            const manager = await Manager.findOne({ userId: user._id })
                .populate('department', 'dep_name')
                .populate('teams');
            if (manager) {
                additionalData = {
                    managerId: manager.managerId,
                    department: manager.department,
                    designation: manager.designation,
                    teams: manager.teams
                };
            }
        }

        const completeProfile = {
            _id: userProfile._id,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                profileImage: user.profileImage
            },
            ...additionalData,
            joiningDate: userProfile.joiningDate,
            leaveBalances: userProfile.leaveBalances,
            leavePolicy: userProfile.leavePolicy,
            createdAt: userProfile.createdAt,
            updatedAt: userProfile.updatedAt
        };

        return res.status(200).json({
            success: true,
            userProfile: completeProfile
        });
    } catch (error) {
        logger.error(`Error fetching user profile by ID: ${error.message}`);
        return res.status(500).json({ success: false, error: "Server error in fetching user profile" });
    }
};

// Update a user profile
const updateUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            email,
            password,
            joiningDate,
            employeeId,
            designation,
            department,
            salary,
            gender,
            dob,
            maritalStatus,
            leavePolicy,
            status,
            leaveBalances
        } = req.body;

        // First verify the profile exists
        const userProfile = await UserProfile.findById(id);
        if (!userProfile) {
            return res.status(404).json({ success: false, error: "User profile not found" });
        }

        // Get the user from the profile
        const user = await User.findById(userProfile.userId);
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        // Update user information
        if (name) user.name = name;
        if (email && email !== user.email) {
            // Check if new email already exists for different user
            const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
            if (existingUser) {
                return res.status(400).json({ success: false, error: "Email already in use by another user" });
            }
            user.email = email;
        }
        
        // Handle password update if provided
        if (password && password.trim() !== '') {
            const hashPassword = await bcrypt.hash(password, 10);
            user.password = hashPassword;
        }
        
        if (status) user.status = status;
        if (req.file) user.profileImage = req.file.filename;

        await user.save();

        // Update UserProfile
        if (joiningDate) userProfile.joiningDate = joiningDate;
        if (leavePolicy) userProfile.leavePolicy = leavePolicy;
        if (leaveBalances) {userProfile.leaveBalances = leaveBalances;}
        await userProfile.save();

        // Update Employee or Manager based on role
        if (user.role === 'employee') {
            const employee = await Employee.findOne({ userId: user._id });
            if (employee) {
                if (employeeId) employee.employeeId = employeeId;
                if (designation) employee.designation = designation;
                if (department) employee.department = department;
                if (salary) employee.salary = salary;
                if (gender) employee.gender = gender;
                if (dob) employee.dob = dob;
                if (maritalStatus) employee.maritalStatus = maritalStatus;

                await employee.save();
            }
        } else if (user.role === 'manager') {
            const manager = await Manager.findOne({ userId: user._id });
            if (manager) {
                if (employeeId) manager.managerId = employeeId; // Using employeeId for managerId
                if (designation) manager.designation = designation;
                if (department) manager.department = department;

                await manager.save();
            }
        }

        logger.info(`User profile ${id} updated successfully.`);
        return res.status(200).json({
            success: true,
            message: "User profile updated successfully"
        });
    } catch (error) {
        logger.error(`Error updating user profile ${id}: ${error.message}`);
        return res.status(500).json({ success: false, error: "Server error in updating user profile" });
    }
};

// Delete a user profile
const deleteUserProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const userProfile = await UserProfile.findById(id);
        if (!userProfile) {
            return res.status(404).json({ success: false, error: "User profile not found" });
        }

        const userId = userProfile.userId;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        // Delete employee or manager records
        if (user.role === 'employee') {
            await Employee.deleteOne({ userId: userId });
        } else if (user.role === 'manager') {
            await Manager.deleteOne({ userId: userId });
        }

        // Delete user profile and user
        await UserProfile.deleteOne({ _id: id });
        await User.deleteOne({ _id: userId });

        logger.info(`User profile ${id} deleted successfully.`);
        return res.status(200).json({
            success: true,
            message: "User profile deleted successfully"
        });
    } catch (error) {
        logger.error(`Error deleting user profile ${id}: ${error.message}`);
        return res.status(500).json({ success: false, error: "Server error in deleting user profile" });
    }
};

export { createUserProfile, getUserProfiles, getUserProfileById, updateUserProfile, deleteUserProfile, upload };