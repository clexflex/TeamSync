import jwt from "jsonwebtoken";
import User from "../models/User.js"
import bcrypt from "bcrypt"

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email })
        if (!user) {
            res.status(404).json({ success: false, error: "User Not Found." })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            res.status(404).json({ success: false, error: "Incorrect Password." })
        }

        const token = jwt.sign({ _id: user._id, role: user.role },
            process.env.JWT_KEY, { expiresIn: "10d" } //How much time you can stay logged in into system
        )

        res.status(200).json({ success: true, token, user: { _id: user._id, name: user.name, role: user.role }, });
    } catch (error) {
        console.log(error.message)
    }
}

export { login }