import Employee from "../models/Employee.js"
import Salary from "../models/Salary.js"
import logger from "../utils/logger.js"; 
const addSalary = async (req, res) => {
    try {
        const { employeeId, basicSalary, allowances, deductions, payDate } = req.body

        const totalSalary = parseInt(basicSalary) + parseInt(allowances) - parseInt(deductions)

        const newSalary = new Salary({
            employeeId,
            basicSalary,
            allowances,
            deductions,
            netSalary: totalSalary,
            payDate
        })

        await newSalary.save()
        logger.info(`Salary record added for Employee ID ${employeeId}. Net Salary: ${totalSalary}`);
        return res.status(200).json({ success: true })

    } catch (error) {
        logger.error(`Error adding salary record for Employee ID ${employeeId}: ${error.message}`);
        return res.status(500).json({ success: false, error: "salary add server error" })
    }
}
const getSalary = async (req, res) => {
    try {
        const {id, role} = req.params;
        let salary
        if(role ==="admin") {
            salary = await Salary.find({employeeId:id}).populate('employeeId', 'employeeId')
        } else {
            const employee = await Employee.findOne({userId: id})
            salary = await Salary.find({employeeId:employee._id}).populate('employeeId', 'employeeId')
        }
        logger.info(`Fetched salary records for Employee/User ID ${id}, Role: ${role}.`);
        return res.status(200).json({ success: true , salary })

    } catch (error) {
        logger.error(`Error fetching salary records for Employee/User ID ${id}: ${error.message}`);
        console.log(error)
        return res.status(500).json({ success: false, error: "salary Get server error" })
    }
}

export { addSalary, getSalary}