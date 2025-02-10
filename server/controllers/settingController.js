import User from "../models/User.js";
import bcrypt from "bcrypt";
import logger from "../utils/logger.js"; 
const changePassword = async (req, res) => {
  
  const { userId, oldPassword, newPassword } = req.body;

  try {
    if (!userId || !oldPassword || !newPassword) {
      logger.warn(`Password change attempt failed due to missing fields for User ID ${userId}.`);
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`Password change attempt failed: User ID ${userId} not found.`);
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Check if old password matches
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      logger.warn(`User ID ${userId} attempted password change with incorrect old password.`);
      return res.status(400).json({ success: false, error: "Old password is incorrect" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();
    logger.info(`User ID ${userId} successfully changed their password.`);
    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    logger.error(`Error changing password for User ID ${userId}: ${error.message}`);
    console.error("Error in changePassword:", error);
    return res.status(500).json({ success: false, error: "Server error while changing password" });
  }
};

export { changePassword };
