import mongoose from "mongoose";
import { Schema } from "mongoose";

const teamSchema = new Schema({
    name: { type: String, required: true },
    managerId: { type: Schema.Types.ObjectId, ref: "Manager", required: true },
    department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    description: { type: String },
    members: [{ type: Schema.Types.ObjectId, ref: "Employee" }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
    }, {
    timestamps: true
});

// Simplified pre-save hook that only checks current team assignment
teamSchema.pre('save', async function (next) {
    if (this.isModified('members')) {
        const Employee = mongoose.model('Employee');

        // Only check employees that are being added (not already in the team)
        const currentMembers = new Set(this.members.map(id => id.toString()));
        const existingMembers = new Set((await Employee.find({ teamId: this._id }, '_id'))
            .map(emp => emp._id.toString()));

        const newMembers = [...currentMembers].filter(id => !existingMembers.has(id));

        if (newMembers.length > 0) {
            // Check if any new members are already in other teams
            const assignedEmployees = await Employee.find({
                _id: { $in: newMembers },
                teamId: { $ne: null }
            });

            if (assignedEmployees.length > 0) {
                throw new Error('One or more employees are already assigned to another team');
            }
        }

        // Update all new members with the team and manager
        if (newMembers.length > 0) {
            await Employee.updateMany(
                { _id: { $in: newMembers } },
                {
                    $set: {
                        teamId: this._id,
                        managerId: this.managerId
                    }
                }
            );
        }

        // Remove team reference from employees no longer in the team
        const removedMembers = [...existingMembers].filter(id => !currentMembers.has(id));
        if (removedMembers.length > 0) {
            await Employee.updateMany(
                { _id: { $in: removedMembers } },
                {
                    $unset: {
                        teamId: "",
                        managerId: ""
                    }
                }
            );
        }
    }
    next();
});

teamSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    // Remove team references from all associated employees
    await mongoose.model('Employee').updateMany(
        { teamId: this._id },
        {
            $unset: {
                teamId: "",
                managerId: ""
            }
        }
    );

    // Remove team reference from manager
    await mongoose.model('Manager').updateOne(
        { _id: this.managerId },
        { $pull: { teams: this._id } }
    );

    next();
});

const Team = mongoose.model("Team", teamSchema);
export default Team;