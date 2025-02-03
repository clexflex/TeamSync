import Team from "../models/Team.js";
import Manager from "../models/Manager.js";
import Employee from "../models/Employee.js";


// Get a specific team by ID
const getTeamById = async (req, res) => {
    try {
        const { id } = req.params;

        const team = await Team.findById(id)
            .populate("managerId", "userId designation")
            .populate("department", "dep_name");

        if (!team) {
            return res.status(404).json({ success: false, error: "Team not found." });
        }

        return res.status(200).json({ success: true, team });
    } catch (error) {
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
            return res.status(404).json({ success: false, error: "Team not found." });
        }

        // Update all employees in the team to remove team association
        await Employee.updateMany(
            { teamId: id },
            { 
                $unset: { 
                    teamId: "",
                    managerId: "" 
                }
            }
        );

        // Remove team reference from manager
        await Manager.updateOne(
            { _id: team.managerId },
            { $pull: { teams: team._id } }
        );

        // Delete the team
        await team.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Team and related references deleted successfully."
        });

    } catch (error) {
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

        return res.status(201).json({ success: true, team });
    } catch (error) {
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

        return res.status(200).json({ success: true, teams: teamsWithCount });
    } catch (error) {
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

        return res.status(200).json({ success: true, teams });
    } catch (error) {
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

        const employee = await Employee.findById(employeeId);
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

        return res.status(200).json({ success: true, message: "Member added successfully." });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Failed to add member." });
    }
};
const updateTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, members } = req.body;

        // Find the existing team with all necessary populated fields
        const team = await Team.findById(id)
            .populate('members')
            .populate('managerId');
            
        if (!team) {
            return res.status(404).json({ success: false, error: "Team not found." });
        }

        // Check authorization for managers
        if (req.user.role === 'manager' && team.managerId.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: "Not authorized to update this team" });
        }

        // Get current team members for comparison
        const currentMembers = team.members.map(member => member.toString());
        const newMembers = members.map(id => id.toString());

        // Find members to remove and add
        const membersToRemove = currentMembers.filter(id => !newMembers.includes(id));
        const membersToAdd = newMembers.filter(id => !currentMembers.includes(id));

        // Validate new members aren't in other teams
        if (membersToAdd.length > 0) {
            const conflictingEmployees = await Employee.find({
                _id: { $in: membersToAdd },
                teamId: { $ne: null, $ne: team._id }
            });

            if (conflictingEmployees.length > 0) {
                const conflictNames = conflictingEmployees.map(emp => emp.employeeId).join(", ");
                return res.status(400).json({
                    success: false,
                    error: `Employees already assigned to another team: ${conflictNames}`
                });
            }
        }

        // Update team basic info
        team.name = name;
        team.description = description;
        team.members = members;
        await team.save();

        // Update removed employees - only unset teamId if they're actually being removed
        if (membersToRemove.length > 0) {
            await Employee.updateMany(
                { 
                    _id: { $in: membersToRemove },
                    teamId: team._id // Only update if they're actually in this team
                },
                { 
                    $unset: { 
                        teamId: "",
                        managerId: "" 
                    }
                }
            );
        }

        // Update added employees
        if (membersToAdd.length > 0) {
            await Employee.updateMany(
                { _id: { $in: membersToAdd } },
                { 
                    $set: {
                        teamId: team._id,
                        managerId: team.managerId._id
                    }
                }
            );
        }

        return res.status(200).json({
            success: true,
            message: "Team updated successfully",
            team: await Team.findById(id)
                .populate('members')
                .populate('managerId')
                .populate('department')
        });

    } catch (error) {
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

        const team = await Team.findById(id);
        if (!team) {
            return res.status(404).json({ success: false, error: "Team not found." });
        }

        const employee = await Employee.findById(employeeId);
        if (!employee || !employee.teamId || employee.teamId.toString() !== id) {
            return res.status(404).json({ success: false, error: "Employee not found in this team." });
        }

        // Update employee document - only remove references if they match this team
        if (employee.teamId.toString() === id) {
            employee.teamId = null;
            if (employee.managerId && employee.managerId.toString() === team.managerId.toString()) {
                employee.managerId = null;
            }
            await employee.save();
        }

        // Remove from team members array
        team.members = team.members.filter(member => member.toString() !== employeeId);
        await team.save();

        return res.status(200).json({ success: true, message: "Member removed successfully." });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Failed to remove member." });
    }
};

export {
    createTeam,
    getTeams,
    getTeamMembers,
    updateTeam,
    deleteTeam,
    getTeamById,
    getManagerTeams,
    addTeamMember,
    removeTeamMember
};
