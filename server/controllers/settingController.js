import User from "../models/User.js";
import bcrypt from "bcrypt";

const changePassword = async (req, res) => {
  
  const { userId, oldPassword, newPassword } = req.body;

  try {
    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Check if old password matches
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Old password is incorrect" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in changePassword:", error);
    return res.status(500).json({ success: false, error: "Server error while changing password" });
  }
};

export { changePassword };
