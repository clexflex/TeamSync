import axios from "axios"
import { FaEdit, FaEye, FaMoneyBill, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export const columns = [
    {
        name: "S No",
        selector: (row) => row.sno,
        width: '70px',
    },
    {
        name: "Employee Name",
        selector: (row) => row.name,
        sortable: true,  
        width: '200px',
    },
    {
        name: "Image",
        selector: (row) => row.profileImage,
        width: '70px',
    },
    {
        name: "Department",
        selector: (row) => row.dep_name,
        width: '150px',
    },
    {
        name: "DOB",
        selector: (row) => row.dob ,
        sortable: true,  
         width: '100px',
    },
    {
        name: "Action",
        selector: (row) => row.action,
       
    },
]

export const fetchDepartments = async () => {
    let departments
    try {
        const response = await axios.get('http://localhost:3000/api/department', {
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
                className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-green-600 hover:bg-green-200 rounded transition-colors duration-200"
            >
                <FaMoneyBill className="text-sm" />
                <span>Salary</span>
            </button>
            <button 
                className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded transition-colors duration-200"
            >
                <FaTrash className="text-sm" />
                <span>Leave</span>
            </button>
        </div>
    )
}