import Team from "../models/Team.js";
import Manager from "../models/Manager.js";
import Employee from "../models/Employee.js";
import logger from "../utils/logger.js"; 
const isAuthorizedForTeam = async (userId, teamId, role) => {
    if (role === 'admin') return true;
    if (role === 'manager') {
        const manager = await Manager.findOne({ userId }).populate('department');
        const team = await Team.findById(teamId).populate('department');
        // Manager exists and team exists
        if (!manager || !team) return false;
        // Check if manager belongs to the same department as the team
        return manager.department.toString() === team.department.toString();
    }
    return false;
};
// Get a specific team by ID
const getTeamById = async (req, res) => {
    try {
        const { id } = req.params;

        const team = await Team.findById(id)
            .populate({
                path: "managerId",
                populate: {
                    path: "userId",
                    select: "name email"
                }
            })
            .populate("department", "dep_name");

        if (!team) {
            return res.status(404).json({ success: false, error: "Team not found." });
        }
        logger.info(`Fetched team with ID ${id}.`);
        return res.status(200).json({ success: true, team });
    } catch (error) {
        logger.error(`Error fetching team with ID ${id}: ${error.message}`);
        return res.status(500).json({ success: false, error: "Failed to fetch team." });
    }
};
// Enhanced deleteTeam function with cascading deletion
const deleteTeam = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the team and ensure it exists
        const team = await Team.findById(id);
        if (!team) {
            return res.status(404).json({ success: false, error: "Team not found" });
        }
        // Check authorization
        const isAuthorized = await isAuthorizedForTeam(req.user._id, id, req.user.role);
        if (!isAuthorized) {
            return res.status(403).json({ success: false, error: "Not authorized to delete this team" });
        }

        await Employee.updateMany(
            { teamId: id },
            { $unset: { teamId: "", managerId: "" } }
        );

        await Manager.updateOne(
            { _id: team.managerId },
            { $pull: { teams: team._id } }
        );

        await team.deleteOne();
        logger.info(`Deleting team with ID ${id}.`);
        return res.status(200).json({
            success: true,
            message: "Team and related references deleted successfully"
        });

    } catch (error) {
        logger.error(`Error deleting team with ID ${id}: ${error.message}`);
        console.error('Error deleting team:', error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to delete team"
        });
    }
};
// Get members of a team
const getTeamMembers = async (req, res) => {
    try {
        const { id } = req.params;

        const employees = await Employee.find({ teamId: id })
            .populate("userId", "name email")
            .populate("department", "dep_name");

        return res.status(200).json({ success: true, employees });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch team members." });
    }
};
// Create a new team with members
const createTeam = async (req, res) => {
    try {
        const { name, managerId, department, description, members } = req.body;

        // Verify that the manager exists
        const manager = await Manager.findById(managerId).populate('department');
        if (!manager) {
            return res.status(404).json({ success: false, error: "Manager not found" });
        }

        // For managers, ensure they can only create teams for themselves
        if (req.user.role === 'manager' && manager.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: "Unauthorized to create team for another manager" });
        }

        // Validate employees
        if (members && members.length > 0) {
            const conflictingEmployees = await Employee.find({
                _id: { $in: members },
                teamId: { $ne: null }
            });
            if (conflictingEmployees.length > 0) {
                const conflictNames = conflictingEmployees.map(emp => emp.userId).join(", ");
                return res.status(400).json({
                    success: false,
                    error: `Employees already assigned to another team: ${conflictNames}`
                });
            }
        }

        // Create the new team
        const team = new Team({
            name,
            managerId,
            department,
            description,
            members: members || []
        });
        await team.save();

        // Update `teamId` and `managerId` in the Employee model
        if (members && members.length > 0) {
            await Employee.updateMany(
                { _id: { $in: members } },
                { $set: { teamId: team._id, managerId: managerId } }
            );
        }

        // Add the team to the manager's list of teams
        await Manager.findByIdAndUpdate(
            managerId,
            { $push: { teams: team._id } }
        );
        logger.info(`Team "${name}" created successfully by Manager ID ${managerId}.`);
        return res.status(201).json({ success: true, team });
    } catch (error) {
        logger.error(`Error creating team "${name}" by Manager ID ${managerId}: ${error.message}`);
        console.error('Error creating team:', error);
        return res.status(500).json({ 
            success: false, 
            error: error.message || "Failed to create team" 
        });
    }
};
// Get teams based on user role
const getTeams = async (req, res) => {
    try {
        let query = {};
        
        // If user is a manager, only show their teams
        if (req.user.role === 'manager') {
            const manager = await Manager.findOne({ userId: req.user._id });
            if (!manager) {
                return res.status(404).json({ success: false, error: "Manager not found" });
            }
            query.managerId = manager._id;
        }

        const teams = await Team.find(query)
            .populate('managerId', 'userId')
            .populate('department', 'dep_name')
            .populate({
                path: 'managerId',
                populate: {
                    path: 'userId',
                    select: 'name email'
                }
            });

        // Add member count to each team
        const teamsWithCount = await Promise.all(teams.map(async (team) => {
            const count = await Employee.countDocuments({ teamId: team._id });
            return {
                ...team.toObject(),
                memberCount: count
            };
        }));
        logger.info(`Fetched all teams successfully for User ID ${req.user._id}, Role: ${req.user.role}.`);
        return res.status(200).json({ success: true, teams: teamsWithCount });
    } catch (error) {
        logger.error(`Error fetching teams for User ID ${req.user._id}: ${error.message}`);
        return res.status(500).json({ success: false, error: error.message });
    }
};
// Get teams for a specific manager
const getManagerTeams = async (req, res) => {
    try {
        const { managerId } = req.params;
        const teams = await Team.find({ managerId })
            .populate('department', 'dep_name')
            .populate({
                path: 'members',
                populate: {
                    path: 'userId',
                    select: 'name email'
                }
            });
        logger.info(`Fetched teams managed by Manager ID ${managerId}.`);
        return res.status(200).json({ success: true, teams });
    } catch (error) {
        logger.error(`Error fetching teams managed by Manager ID ${managerId}: ${error.message}`);
        return res.status(500).json({ success: false, error: error.message });
    }
};
// Add a member to a team
const addTeamMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { employeeId } = req.body;

        const team = await Team.findById(id);
        if (!team) {
            return res.status(404).json({ success: false, error: "Team not found." });
        }
        const isAuthorized = await isAuthorizedForTeam(req.user._id, id, req.user.role);
        if (!isAuthorized) {
            return res.status(403).json({ success: false, error: "Not authorized to modify team members" });
        }
        const employee = await Employee.findById(employeeId).populate('department');
        if (!employee) {
            return res.status(404).json({ success: false, error: "Employee not found." });
        }

        if (employee.teamId) {
            return res.status(400).json({ success: false, error: "Employee is already in another team." });
        }

        employee.teamId = id;
        employee.managerId = team.managerId;
        await employee.save();

        team.members.push(employeeId);
        await team.save();
        logger.info(`Added Employee ID ${employeeId} to Team ID ${id}.`);
        return res.status(200).json({ success: true, message: "Member added successfully." });
    } catch (error) {
        logger.error(`Error adding Employee ID ${employeeId} to Team ID ${id}: ${error.message}`);
        return res.status(500).json({ success: false, error: "Failed to add member." });
    }
};


const updateTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, managerId } = req.body;

        // Find the existing team
        const team = await Team.findById(id);
        if (!team) {
            return res.status(404).json({ success: false, error: "Team not found" });
        }

        // Check authorization
        const isAuthorized = await isAuthorizedForTeam(req.user._id, id, req.user.role);
        if (!isAuthorized) {
            return res.status(403).json({ success: false, error: "Not authorized to update this team" });
        }

        // If manager is being changed and user is not admin, prevent the change
        if (managerId && managerId !== team.managerId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                error: "Only admin can change team manager" 
            });
        }

        // If manager is being changed, handle the manager change process
        if (managerId && managerId !== team.managerId.toString()) {
            // Verify new manager exists
            const newManager = await Manager.findById(managerId);
            if (!newManager) {
                return res.status(404).json({ 
                    success: false, 
                    error: "New manager not found" 
                });
            }

            // Remove team from old manager's teams array
            await Manager.findByIdAndUpdate(
                team.managerId,
                { $pull: { teams: team._id } }
            );

            // Add team to new manager's teams array
            await Manager.findByIdAndUpdate(
                managerId,
                { $push: { teams: team._id } }
            );

            // Update all team members with new managerId
            await Employee.updateMany(
                { teamId: team._id },
                { $set: { managerId: managerId } }
            );
        }

        // Update team details
        const updatedTeam = await Team.findByIdAndUpdate(
            id,
            {
                name: name || team.name,
                description: description || team.description,
                managerId: managerId || team.managerId,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).populate('managerId', 'userId designation')
         .populate('department', 'dep_name');
        logger.info(`Updated team with ID ${id} successfully.`);
        return res.status(200).json({
            success: true,
            message: "Team updated successfully",
            team: updatedTeam
        });

    } catch (error) {
        logger.error(`Error updating team with ID ${id}: ${error.message}`);
        console.error('Error updating team:', error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to update team"
        });
    }
};
const removeTeamMember = async (req, res) => {
    try {
        const { id, employeeId } = req.params;
        const team = await Team.findById(id).populate('department');
        if (!team) {
            return res.status(404).json({ success: false, error: "Team not found." });
        }
        const isAuthorized = await isAuthorizedForTeam(req.user._id, id, req.user.role);
        if (!isAuthorized) {
            return res.status(403).json({ success: false, error: "Not authorized to modify team members" });
        }
        const employee = await Employee.findById(employeeId);
        if (!employee || !employee.teamId || employee.teamId.toString() !== id) {
            return res.status(404).json({ success: false, error: "Employee not found in this team." });
        }
        
        employee.teamId = null;
        employee.managerId = null;
        await employee.save();

        // Remove from team members array
        team.members = team.members.filter(member => member.toString() !== employeeId);
        await team.save();
        logger.info(`Removed Employee ID ${employeeId} from Team ID ${id}.`);
        return res.status(200).json({ success: true, message: "Member removed successfully." });
    } catch (error) {
        logger.error(`Error removing Employee ID ${employeeId} from Team ID ${id}: ${error.message}`);
        return res.status(500).json({ success: false, error: "Failed to remove member." });
    }
};

export {     createTeam,     getTeams,     getTeamMembers,     updateTeam,     deleteTeam,     getTeamById,     getManagerTeams,     addTeamMember,     removeTeamMember };
