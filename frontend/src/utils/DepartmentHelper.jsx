import axios from "axios"
import { useNavigate } from "react-router-dom"
import { FaEdit, FaTrash } from 'react-icons/fa'
import config from "../config";

export const columns = [
    {
        name: "S No",
        selector: (row) => row.sno,
        width: '100px',
    },
    {
        name: "Department Name",
        selector: (row) => row.dep_name,
        sortable: true,
       
    },
    {
        name: "Action",
        selector: (row) => row.action,
        width: '200px',
    },
]

export const DepartmentButtons = ({ _id, onDepartmentDelete }) => {
    const navigate = useNavigate()

    const handleDelete = async (id) => {
        const confirm = window.confirm("Do you want to delete this department?")
        if (confirm) {
            try {
                const response = await axios.delete(`${config.API_URL}/api/department/${id}`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem('token')}`
                    }
                })
                if (response.data.success) {
                    onDepartmentDelete(id)
                }
            } catch (error) {
                if (error.response && !error.response.data.success) {
                    alert(error.response.data.error)
                }
            }
        }
    }

    return (
        <div className="flex gap-2">
            <button 
                onClick={() => navigate(`/admin-dashboard/department/${_id}`)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded transition-colors duration-200"
            >
                <FaEdit className="text-sm" />
                <span>Edit</span>
            </button>
            <button 
                onClick={() => handleDelete(_id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded transition-colors duration-200"
            >
                <FaTrash className="text-sm" />
                <span>Delete</span>
            </button>
        </div>
    )
}