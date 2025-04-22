import mongoose from "mongoose";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import Manager from "../models/Manager.js";
import UserProfile from "../models/UserProfile.js";
import bcrypt from "bcrypt";
import { uploadProfileImage } from '../utils/firebase-multer.js';
import { uploadFileToFirebase, deleteFileFromFirebase, getFileSignedUrl } from '../config/firebase.js';
import logger from "../utils/logger.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";
import Salary from "../models/Salary.js";
import Document from "../models/Document.js";
import Ticket from "../models/Ticket.js";
import Team from "../models/Team.js";
import Notification from "../models/Notification.js";
import ResignationRequest from "../models/ResignationRequest.js";
export { uploadProfileImage as upload };

// Helper to create default leave balances
const createDefaultLeaveBalances = () => {
    return [
        { leaveType: "Casual Leave", balance: 0, used: 0, carryForward: 0 },
        { leaveType: "Sick Leave", balance: 0, used: 0, carryForward: 0 },
        { leaveType: "Paid Leave", balance: 0, used: 0, carryForward: 0 },
        { leaveType: "Half Leave", balance: 0, used: 0, carryForward: 0 }
    ];
};

// Parse nested JSON objects from FormData
const parseNestedObjects = (obj) => {
    const result = {};
    Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string' && obj[key].startsWith('{') && obj[key].endsWith('}')) {
            try {
                result[key] = JSON.parse(obj[key]);
            } catch (e) {
                result[key] = obj[key];
            }
        } else if (typeof obj[key] === 'string' && obj[key].startsWith('[') && obj[key].endsWith(']')) {
            try {
                result[key] = JSON.parse(obj[key]);
            } catch (e) {
                result[key] = obj[key];
            }
        } else {
            result[key] = obj[key];
        }
    });
    return result;
};

// Create a new user profile
const createUserProfile = async (req, res) => {
    try {
        // Parse any JSON strings in the form data
        let formData = parseNestedObjects(req.body);

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
            status = "active", // default to active
            company,

            // Personal Information
            companyEmail,
            location,
            primaryContactNo,
            bloodGroup,
            nationality,
            marriageDate,
            spouse,
            fatherName,
            religion,
            physicallyHandicapped,
            height,
            weight,

            // Address
            address,

            // Education Information
            education,

            // Employment & Job Information
            confirmationDate,
            noticePeriod,
            employmentStatus,
            currentCompanyExperience,
            previousExperience,
            totalExperience,
            probationPeriod,

            // Previous Employment
            previousEmployment,

            // Salary Information
            salaryInfo
        } = formData;

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
        let profileImageData = null;
        if (req.file) {
            try {
                profileImageData = await uploadFileToFirebase(req.file, 'profile-images');
                logger.info(`Profile image uploaded to Firebase for user ${email}`);
            } catch (error) {
                logger.error(`Error uploading profile image to Firebase: ${error.message}`);
                return res.status(500).json({ success: false, error: "Error uploading profile image" });
            }
        }

        const newUser = new User({
            name,
            email,
            password: hashPassword,
            role,
            status,
            profileImage: profileImageData ? profileImageData.url : "",
            profileImagePath: profileImageData ? profileImageData.path : ""
        });
        const savedUser = await newUser.save();

        // Create user profile with extended fields
        const newUserProfile = new UserProfile({
            userId: savedUser._id,
            company, 
            leavePolicy: leavePolicy || null,
            leaveBalances: createDefaultLeaveBalances(),
            joiningDate: joiningDate || new Date(),
            lastLeaveBalanceReset: null,

            // Personal Information
            companyEmail,
            location,
            primaryContactNo,
            bloodGroup,
            nationality,
            marriageDate,
            spouse,
            fatherName,
            religion,
            physicallyHandicapped: physicallyHandicapped === 'true' || physicallyHandicapped === true,
            height,
            weight,

            // Address
            address,

            // Education Information
            education: education || [{
                degree: '',
                institute: '',
                startDate: '',
                endDate: '',
                grade: ''
            }],

            // Employment & Job Information
            confirmationDate,
            noticePeriod,
            employmentStatus,
            currentCompanyExperience,
            previousExperience,
            totalExperience,
            probationPeriod,

            // Previous Employment
            previousEmployment: previousEmployment || [{
                company: '',
                designation: '',
                startDate: '',
                endDate: '',
                reasonForLeaving: ''
            }],

            // Salary Information
            salaryInfo
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
        return res.status(500).json({ success: false, error: `Server error in creating user profile: ${error.message}` });
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
            .populate('leavePolicy', 'name');

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
                hasLeavePolicy: !!profile.leavePolicy,
                company: profile.company,
                leavePolicyId: profile.leavePolicy?._id || null,
                leavePolicyName: profile.leavePolicy?.name || null,
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

        // Build complete profile with all additional fields
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

            // Include all additional fields from user profile
            joiningDate: userProfile.joiningDate,
            company: userProfile.company,

            // Personal Information
            companyEmail: userProfile.companyEmail,
            location: userProfile.location,
            primaryContactNo: userProfile.primaryContactNo,
            bloodGroup: userProfile.bloodGroup,
            nationality: userProfile.nationality,
            marriageDate: userProfile.marriageDate,
            spouse: userProfile.spouse,
            fatherName: userProfile.fatherName,
            religion: userProfile.religion,
            physicallyHandicapped: userProfile.physicallyHandicapped,
            height: userProfile.height,
            weight: userProfile.weight,

            // Address
            address: userProfile.address,

            // Education Information
            education: userProfile.education,

            // Employment & Job Information
            confirmationDate: userProfile.confirmationDate,
            noticePeriod: userProfile.noticePeriod,
            employmentStatus: userProfile.employmentStatus,
            currentCompanyExperience: userProfile.currentCompanyExperience,
            previousExperience: userProfile.previousExperience,
            totalExperience: userProfile.totalExperience,
            probationPeriod: userProfile.probationPeriod,

            // Previous Employment
            previousEmployment: userProfile.previousEmployment,

            // Salary Information
            salaryInfo: userProfile.salaryInfo,

            // Leave Information
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
        let updateData = req.body;

        // Parse any JSON strings in the form data
        updateData = parseNestedObjects(updateData);

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
            leaveBalances,
            company,

            // Personal Information
            companyEmail,
            location,
            primaryContactNo,
            bloodGroup,
            nationality,
            marriageDate,
            spouse,
            fatherName,
            religion,
            physicallyHandicapped,
            height,
            weight,

            // Address
            address,

            // Education Information
            education,

            // Employment & Job Information
            confirmationDate,
            noticePeriod,
            employmentStatus,
            currentCompanyExperience,
            previousExperience,
            totalExperience,
            probationPeriod,

            // Previous Employment
            previousEmployment,

            // Salary Information
            salaryInfo
        } = updateData;

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
        if (req.file) {
            try {
                // Delete old profile image if exists
                if (user.profileImagePath) {
                    await deleteFileFromFirebase(user.profileImagePath);
                }
                
                // Upload new image
                const profileImageData = await uploadFileToFirebase(req.file, 'profile-images');
                user.profileImage = profileImageData.url;
                user.profileImagePath = profileImageData.path;
                logger.info(`Updated profile image for user ${user.email}`);
            } catch (error) {
                logger.error(`Error updating profile image: ${error.message}`);
                return res.status(500).json({ success: false, error: "Error updating profile image" });
            }
        }
        await user.save();

        // Update UserProfile with all the additional fields
        const profileUpdates = {};

        // Only update fields that were provided
        if (joiningDate) profileUpdates.joiningDate = joiningDate;
        if (leavePolicy) profileUpdates.leavePolicy = leavePolicy;
        if (leaveBalances) profileUpdates.leaveBalances = leaveBalances;
        if (company !== undefined) profileUpdates.company = company; 

        // Personal Information
        if (companyEmail !== undefined) profileUpdates.companyEmail = companyEmail;
        if (location !== undefined) profileUpdates.location = location;
        if (primaryContactNo !== undefined) profileUpdates.primaryContactNo = primaryContactNo;
        if (bloodGroup !== undefined) profileUpdates.bloodGroup = bloodGroup;
        if (nationality !== undefined) profileUpdates.nationality = nationality;
        if (marriageDate !== undefined) profileUpdates.marriageDate = marriageDate;
        if (spouse !== undefined) profileUpdates.spouse = spouse;
        if (fatherName !== undefined) profileUpdates.fatherName = fatherName;
        if (religion !== undefined) profileUpdates.religion = religion;
        if (physicallyHandicapped !== undefined) {
            profileUpdates.physicallyHandicapped = physicallyHandicapped === 'true' || physicallyHandicapped === true;
        }
        if (height !== undefined) profileUpdates.height = height;
        if (weight !== undefined) profileUpdates.weight = weight;

        // Address
        if (address) profileUpdates.address = address;

        // Education Information
        if (education) profileUpdates.education = education;

        // Employment & Job Information
        if (confirmationDate !== undefined) profileUpdates.confirmationDate = confirmationDate;
        if (noticePeriod !== undefined) profileUpdates.noticePeriod = noticePeriod;
        if (employmentStatus !== undefined) profileUpdates.employmentStatus = employmentStatus;
        if (currentCompanyExperience !== undefined) profileUpdates.currentCompanyExperience = currentCompanyExperience;
        if (previousExperience !== undefined) profileUpdates.previousExperience = previousExperience;
        if (totalExperience !== undefined) profileUpdates.totalExperience = totalExperience;
        if (probationPeriod !== undefined) profileUpdates.probationPeriod = probationPeriod;

        // Previous Employment
        if (previousEmployment) profileUpdates.previousEmployment = previousEmployment;

        // Salary Information
        if (salaryInfo) profileUpdates.salaryInfo = salaryInfo;

        if (Object.keys(profileUpdates).length > 0) {
            await UserProfile.updateOne({ _id: id }, { $set: profileUpdates });
        }

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
        return res.status(500).json({ success: false, error: `Server error in updating user profile: ${error.message}` });
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
const bulkDeleteUserProfiles = async (req, res) => {
    try {
        const { profileIds } = req.body;
        
        if (!profileIds || !Array.isArray(profileIds) || profileIds.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: "Please provide a valid array of profile IDs to delete" 
            });
        }

        const results = {
            success: true,
            totalAttempted: profileIds.length,
            totalDeleted: 0,
            failed: []
        };

        // Process each profile ID
        for (const profileId of profileIds) {
            try {
                const userProfile = await UserProfile.findById(profileId);
                if (!userProfile) {
                    results.failed.push({ id: profileId, error: "User profile not found" });
                    continue;
                }

                const userId = userProfile.userId;
                const user = await User.findById(userId);

                if (!user) {
                    results.failed.push({ id: profileId, error: "Associated user not found" });
                    continue;
                }

                // Delete employee or manager related data
                if (user.role === 'employee') {
                    const employee = await Employee.findOne({ userId: userId });
                    
                    if (employee) {
                        // Clean up team association if exists
                        if (employee.teamId) {
                            await Team.updateOne(
                                { _id: employee.teamId },
                                { $pull: { members: employee._id }}
                            );
                        }
                        
                        await Employee.deleteOne({ userId: userId });
                    }
                } else if (user.role === 'manager') {
                    const manager = await Manager.findOne({ userId: userId });
                    
                    if (manager) {
                        // Clean up any teams managed by this manager
                        if (manager.teams && manager.teams.length > 0) {
                            for (const teamId of manager.teams) {
                                await Team.updateOne(
                                    { _id: teamId },
                                    { $set: { managerId: null }}
                                );
                            }
                        }
                        
                        await Manager.deleteOne({ userId: userId });
                    }
                }

                // Delete related records
                await Attendance.deleteMany({ userId: userId });
                await Leave.deleteMany({ userId: userId });
                await Salary.deleteMany({ userId: userId });
                await Document.deleteMany({ userId: userId });
                await Ticket.deleteMany({ userId: userId });
                await Notification.deleteMany({ userId: userId });
                await ResignationRequest.deleteMany({ userId: userId });

                // Delete profile image if exists
                if (user.profileImagePath) {
                    try {
                        await deleteFileFromFirebase(user.profileImagePath);
                    } catch (imageError) {
                        logger.error(`Error deleting profile image for user ${userId}: ${imageError.message}`);
                        // Continue with deletion even if image delete fails
                    }
                }

                // Delete user profile and user
                await UserProfile.deleteOne({ _id: profileId });
                await User.deleteOne({ _id: userId });

                // Increment success counter
                results.totalDeleted++;
                logger.info(`User profile ${profileId} deleted successfully during bulk operation.`);
            } catch (profileError) {
                logger.error(`Error deleting user profile ${profileId}: ${profileError.message}`);
                results.failed.push({ id: profileId, error: profileError.message });
            }
        }

        // Set overall success based on deletion results
        if (results.totalDeleted === 0) {
            results.success = false;
        }

        return res.status(200).json(results);
    } catch (error) {
        logger.error(`Error in bulk delete operation: ${error.message}`);
        return res.status(500).json({ 
            success: false, 
            error: "Server error in bulk deleting user profiles",
            message: error.message
        });
    }
};

// Function to change a user's role between employee and manager
const changeUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            newRole,          // 'employee' or 'manager'
            newId,            // New employee/manager ID
            department,       // Department ID
            designation,      // Job title
            salary,           // Only needed when converting to employee
            keepTeamAssignments = false  // Whether to preserve team relationships
        } = req.body;

        if (!newRole || !['employee', 'manager'].includes(newRole)) {
            return res.status(400).json({ 
                success: false, 
                error: "Invalid role specified. Must be 'employee' or 'manager'." 
            });
        }

        if (!newId) {
            return res.status(400).json({ 
                success: false, 
                error: `New ${newRole === 'employee' ? 'employee' : 'manager'} ID is required` 
            });
        }

        if (!department) {
            return res.status(400).json({ 
                success: false, 
                error: "Department ID is required" 
            });
        }

        // Get the user profile
        const userProfile = await UserProfile.findById(id);
        if (!userProfile) {
            return res.status(404).json({ 
                success: false, 
                error: "User profile not found" 
            });
        }

        // Get the user
        const user = await User.findById(userProfile.userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: "User not found" 
            });
        }

        // If current role is the same as new role, return error
        if (user.role === newRole) {
            return res.status(400).json({ 
                success: false, 
                error: `User is already a ${newRole}` 
            });
        }

        // Check if the new ID is already in use
        if (newRole === 'employee') {
            const existingEmployee = await Employee.findOne({ employeeId: newId });
            if (existingEmployee && existingEmployee.userId.toString() !== user._id.toString()) {
                return res.status(400).json({ 
                    success: false, 
                    error: "Employee ID already in use by another employee" 
                });
            }
        } else {
            const existingManager = await Manager.findOne({ managerId: newId });
            if (existingManager && existingManager.userId.toString() !== user._id.toString()) {
                return res.status(400).json({ 
                    success: false, 
                    error: "Manager ID already in use by another manager" 
                });
            }
        }

        // Check if salary is provided when converting to employee
        if (newRole === 'employee' && !salary) {
            return res.status(400).json({ 
                success: false, 
                error: "Salary is required when converting to employee" 
            });
        }

        let result = {};

        try {
            // Case 1: Converting from Employee to Manager
            if (user.role === 'employee' && newRole === 'manager') {
                // Get current employee data
                const employee = await Employee.findOne({ userId: user._id });
                if (!employee) {
                    throw new Error("Employee record not found");
                }

                // Create new manager record
                const newManager = new Manager({
                    userId: user._id,
                    managerId: newId,
                    department: department || employee.department,
                    designation: designation || employee.designation || "Team Manager",
                    teams: []
                });
                await newManager.save();

                // Handle team assignments if user was part of a team
                if (employee.teamId && !keepTeamAssignments) {
                    // Remove from team
                    await Team.updateOne(
                        { _id: employee.teamId },
                        { $pull: { members: employee._id } }
                    );
                }

                // Delete employee record
                await Employee.deleteOne({ _id: employee._id });

                result = {
                    previousRole: 'employee',
                    previousId: employee.employeeId,
                    newRole: 'manager',
                    newId: newManager.managerId
                };
            }
            // Case 2: Converting from Manager to Employee
            else if (user.role === 'manager' && newRole === 'employee') {
                // Get current manager data
                const manager = await Manager.findOne({ userId: user._id });
                if (!manager) {
                    throw new Error("Manager record not found");
                }

                // Handle team assignments
                if (manager.teams && manager.teams.length > 0 && !keepTeamAssignments) {
                    // Option: remove manager from all teams
                    for (const teamId of manager.teams) {
                        await Team.updateOne(
                            { _id: teamId },
                            { $set: { managerId: null } }
                        );
                    }
                }

                // Create new employee record
                const newEmployee = new Employee({
                    userId: user._id,
                    employeeId: newId,
                    department: department || manager.department,
                    designation: designation || manager.designation,
                    salary: salary,
                    dob: userProfile.dob,
                    gender: userProfile.gender,
                    maritalStatus: userProfile.maritalStatus
                });
                await newEmployee.save();

                // Delete manager record
                await Manager.deleteOne({ _id: manager._id });

                result = {
                    previousRole: 'manager',
                    previousId: manager.managerId,
                    newRole: 'employee',
                    newId: newEmployee.employeeId
                };
            }

            // Update user role
            user.role = newRole;
            await user.save();
            
            // Create notification for the user
            const notification = new Notification({
                userId: user._id,
                title: "Role Change",
                message: `Your role has been changed from ${result.previousRole} to ${result.newRole}. Please log out and log back in for changes to take effect.`,
                type: "system",
                isGlobal: false
            });
            await notification.save();
            
            // Also notify admins
            const admins = await User.find({ role: 'admin' });
            if (admins.length > 0) {
                const adminNotification = new Notification({
                    userId: admins[0]._id, // Send to first admin
                    title: "User Role Change",
                    message: `${user.name}'s role has been changed from ${result.previousRole} to ${result.newRole}.`,
                    type: "system",
                    isGlobal: false
                });
                await adminNotification.save();
            }
            
            logger.info(`User ${user.name} (ID: ${user._id}) role changed from ${result.previousRole} to ${result.newRole}`);
            
            return res.status(200).json({
                success: true,
                message: `User role changed successfully from ${result.previousRole} to ${result.newRole}`,
                data: result
            });
        } catch (error) {
            logger.error(`Error in role change process: ${error.message}`);
            return res.status(500).json({ 
                success: false, 
                error: `Error changing user role: ${error.message}` 
            });
        }
    } catch (error) {
        logger.error(`Error changing user role: ${error.message}`);
        return res.status(500).json({ 
            success: false, 
            error: `Server error in changing user role: ${error.message}` 
        });
    }
};

// Add the import for mongoose if not already present
// import mongoose from "mongoose";

export { createUserProfile, getUserProfiles,changeUserRole ,getUserProfileById, updateUserProfile, deleteUserProfile, bulkDeleteUserProfiles };