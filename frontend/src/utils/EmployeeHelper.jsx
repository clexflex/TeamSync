import axios from "axios"
import { FaCalendarCheck, FaEdit, FaEye, FaHome, FaMoneyBill} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import config from "../config";


export const columns = [
    {
        name: "S No",
        selector: (row) => row.sno,
        width: '70px',
        sortable: true,
    },
    {
        name: "Employee",
        selector: (row) => (
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-x-auto ">
                    {row.profileImage}
                </div>
                <div>
                    <div className="font-medium text-gray-800">{row.name}</div>
                    <div className="text-sm text-gray-500">{row.employeeId}</div>
                </div>
            </div>
        ),
        width: '250px',
        sortable: true,
    },
    {
        name: "Department",
        selector: (row) => row.dep_name,
        sortable: true,
        width: '100px',
    },
    {
        name: "Status",
        selector: (row) => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium
                ${row.status === 'Active' ? 'bg-green-100 text-green-800' : 
                 row.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' : 
                 'bg-red-100 text-red-800'}`}>
                {row.status}
            </span>
        ),
        width: '100px',
        sortable: true,
    },
    {
        name: "Action",
        selector: (row) => row.action,
       
    },
];

export const fetchDepartments = async () => {
    let departments;
    try {
        const response = await axios.get(`${config.API_URL}/api/department`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
        })
        if (response.data.success) {
            departments = response.data.departments
        }
    } catch (error) {
        if (error.response && !error.response.data.success) {
            alert(error.response.data.error)
        }
    }
    return departments
};

export const getEmployees = async (id) => {
    let employees;
    try {
        const response = await axios.get(`${config.API_URL}/api/employee/department/${id}`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (response.data.success) {
            employees = response.data.employees;
        }
    } catch (error) {
        if (error.response && !error.response.data.success) {
            alert(error.response.data.error);
        }
    }
    return employees || [];
};



export const EmployeeButtons = ({ Id}) => {
    const navigate = useNavigate()

    return (
        <div className="flex gap-2 ">
            <button 
                onClick={() => navigate(`/admin-dashboard/employees/${Id}`)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded transition-colors duration-200"
            >
                <FaEye className="text-sm" />
                <span>View</span>
            </button>
            <button 
                onClick={() => navigate(`/admin-dashboard/employees/edit/${Id}`)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded transition-colors duration-200"
            >
                <FaEdit className="text-sm" />
                <span>Edit</span>
            </button>
            <button 
                onClick={() => navigate(`/admin-dashboard/employees/salary/${Id}`)}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-green-600 hover:bg-green-200 rounded transition-colors duration-200"
            >
                <FaMoneyBill className="text-sm" />
                <span>Salary</span>
            </button>
            <button 
                className="flex items-center gap-1 px-3 py-1.5 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded transition-colors duration-200"
            >
                <FaCalendarCheck className="text-sm" />
                <span>Attendance</span>
            </button>
            <button 
                onClick={() => navigate(`/admin-dashboard/employees/leaves/${Id}`)}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded transition-colors duration-200"
            >
                <FaHome className="text-sm" />
                <span>Leave</span>
            </button>
        </div>
    )
}