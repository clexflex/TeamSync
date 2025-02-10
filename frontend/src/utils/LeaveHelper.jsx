import { FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom"


export const columns = [
    {
        name: "S No",
        selector: (row) => row.sno,
        width: '90px',
        sortable: true,
    },
    {
        name: "Name",
        selector: (row) => (
            <div className="flex items-center gap-3">
                <div className="font-medium text-gray-800">
                    {row.employeeId ? row.employeeId.userId.name : row.managerId.userId.name}
                </div>
                <div className="text-sm text-gray-500">
                    {row.employeeId ? row.employeeId.employeeId : row.managerId.managerId}
                </div>
            </div>
        ),
        sortable: true,
    },
    {
        name: "Leave Type",
        selector: (row) => row.leaveType,
        sortable: true,
        width: '150px',
    },
    {
        name: "Department",
        selector: (row) => row.department,
        sortable: true,
        width: '150px',
    },
    {
        name: "Days",
        selector: (row) => row.days,
        sortable: true,
        width: '100px',
    },
    {
        name: "Status",
        selector: (row) => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium
                ${row.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                 row.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
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

export const LeaveButtons = ({ Id}) => {
    const navigate = useNavigate()

    const handleView = (id) => {
        navigate(`/admin-dashboard/leaves/${id}`);
    };

    return (
        <div className="flex gap-2 ">
            <button 
                onClick={() => handleView(Id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded transition-colors duration-200"
            >
                <FaEye className="text-sm" />
                <span>View</span>
            </button>
 
        </div>
    )
}