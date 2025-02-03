// This component will display a list of managers and allow adding, editing, and deleting them.

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DataTable from "../shared/DataTable";
import config from "../../config";

const ManagersList = () => {
  const [managers, setManagers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/api/manager`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setManagers(response.data.managers);
      } catch (error) {
        alert("Failed to fetch managers.");
      }
    };
    fetchManagers();
  }, []);

  const handleEdit = (id) => {
    navigate(`/admin-dashboard/managers/edit/${id}`);
  };
  const handleView = (id) => {
    navigate(`/admin-dashboard/manager/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this manager?")) {
      try {
        await axios.delete(`${config.API_URL}/api/manager/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setManagers((prev) => prev.filter((manager) => manager._id !== id));
      } catch (error) {
        alert("Failed to delete manager.");
      }
    }
  };

  const columns = [
    { name: "Name", selector: (row) => row.userId.name, sortable: true },
    { name: "Department", selector: (row) => row.department?.dep_name || "N/A", sortable: true },
    { name: "Designation", selector: (row) => row.designation || "N/A" },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button onClick={() => handleView(row._id)} className="bg-blue-500 text-white px-2 py-1 rounded">
            View
          </button>
          <button onClick={() => handleEdit(row._id)} className="bg-blue-500 text-white px-2 py-1 rounded">
            Edit
          </button>
          <button onClick={() => handleDelete(row._id)} className="bg-red-500 text-white px-2 py-1 rounded">
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-md shadow-md">
      <h2 className="text-xl font-bold mb-6">Managers List</h2>
      <button
        onClick={() => navigate("/admin-dashboard/add-manager")}
        className="bg-blue-600 text-white px-4 py-2 rounded-md mb-4"
      >
        Add Manager
      </button>
      <DataTable columns={columns} data={managers} pagination />
    </div>
  );
};

export default ManagersList;
