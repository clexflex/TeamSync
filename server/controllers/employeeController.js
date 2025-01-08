import multer from "multer"
import Department from "../models/Department.js"
import User from "../models/User.js"
import Employee from "../models/Employee.js"
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

const addEmployee = async (req, res) => {
    try {


        const {
            name,
            email,
            employeeId,
            dob,
            gender,
            maritalStatus,
            designation,
            department,
            salary,
            password,
            role,
        } = req.body;

        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ success: false, error: "user already registered in emp" });
        }

        const hashPassword = await bcrypt.hash(password, 10)

        const newUser = new User({
            name,
            email,
            password: hashPassword,
            department,
            role,
            profileImage: req.file ? req.file.filename : ""
        })
        const savedUser = await newUser.save()

        const newEmployee = new Employee({
            userId: savedUser._id,
            employeeId,
            dob,
            gender,
            maritalStatus,
            designation,
            department,
            salary
        })

        await newEmployee.save()
        return res.status(200).json({ success: true, message: "Employee Created" });
    } catch (error) {
        return res.status(500).json({ success: false, error: "erver error in adding employee" });
    }
};
// for all employees
const getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find().populate('userId', { password: 0 }).populate('department')
        return res.status(200).json({ success: true, employees })
    } catch (error) {
        return res.status(500).json({ success: false, error: "Fetch Employees server error" })
    }
};

// for specefic employee
const getEmployee = async (req, res) => {
    const { id } = req.params;
    try {
        let employee;
        employee = await Employee.findById({ _id: id })
        .populate('userId', { password: 0 })
        .populate('department');

        if(!employee){
            employee =  await Employee.findOne({ userId: id })
            .populate('userId', { password: 0 })
            .populate('department');
        }

        return res.status(200).json({ success: true, employee })
    } catch (error) {
        return res.status(500).json({ success: false, error: "Fetch Employee server error" })
    }
};

const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const employee = await Employee.findById(id);
        if (!employee) {
            return res.status(404).json({ success: false, error: "Employee Not Found!" });
        }

        const user = await User.findById(employee.userId);
        if (!user) {
            return res.status(404).json({ success: false, error: "User Not Found!" });
        }

        // Prepare user update data
        const userUpdateData = {};
        if (updateData.name) userUpdateData.name = updateData.name;
        if (updateData.email) userUpdateData.email = updateData.email;
        if (updateData.role) userUpdateData.role = updateData.role;
        if (updateData.password) {
            userUpdateData.password = await bcrypt.hash(updateData.password, 10);
        }

        // Prepare employee update data
        const employeeUpdateData = {};
        if (updateData.employeeId) employeeUpdateData.employeeId = updateData.employeeId;
        if (updateData.dob) employeeUpdateData.dob = updateData.dob;
        if (updateData.gender) employeeUpdateData.gender = updateData.gender;
        if (updateData.maritalStatus) employeeUpdateData.maritalStatus = updateData.maritalStatus;
        if (updateData.designation) employeeUpdateData.designation = updateData.designation;
        if (updateData.department) employeeUpdateData.department = updateData.department;
        if (updateData.salary) employeeUpdateData.salary = updateData.salary;

        // Only update if there are changes
        if (Object.keys(userUpdateData).length > 0) {
            await User.findByIdAndUpdate(employee.userId, userUpdateData);
        }

        if (Object.keys(employeeUpdateData).length > 0) {
            await Employee.findByIdAndUpdate(id, employeeUpdateData);
        }

        return res.status(200).json({ success: true, message: "Employee Updated" });

    } catch (error) {
        return res.status(500).json({ success: false, error: "Update Employee server error" });
    }
};

const fetchEmployeesByDepId = async (req, res) => {
    const { id } = req.params;
    try {
        const employees = await Employee.find({ department: id })

        return res.status(200).json({ success: true, employees })
    } catch (error) {
        return res.status(500).json({ success: false, error: "Fetch EmployeesByDepId server error" })
    }
};


export { addEmployee, upload, getEmployees, getEmployee, updateEmployee ,fetchEmployeesByDepId}