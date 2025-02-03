import React, { useEffect, useState } from "react";
import axios from "axios";
import config from "../../config";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";

const HolidayManagement = () => {
    const [holidays, setHolidays] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [form, setForm] = useState({
        id: null,
        name: "",
        date: "",
        isCompanyWide: true,
        applicableDepartments: [],
        description: "",
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Fetch holidays and departments
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const holidayResponse = await axios.get(`${config.API_URL}/api/holidays`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                setHolidays(holidayResponse.data.holidays);

                const departmentResponse = await axios.get(`${config.API_URL}/api/department`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                setDepartments(departmentResponse.data.departments);
            } catch (error) {
                console.error("Error fetching data:", error);
                alert("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        if (type === "checkbox") {
            setForm((prev) => ({
                ...prev,
                applicableDepartments: checked
                    ? [...prev.applicableDepartments, value]
                    : prev.applicableDepartments.filter((id) => id !== value),
            }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Handle holiday submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = form.id
                ? `${config.API_URL}/api/holidays/update/${form.id}`
                : `${config.API_URL}/api/holidays/add`;

            const method = form.id ? "put" : "post";

            await axios[method](
                endpoint,
                {
                    name: form.name,
                    date: form.date,
                    isCompanyWide: form.isCompanyWide,
                    applicableDepartments: form.isCompanyWide ? [] : form.applicableDepartments,
                    description: form.description,
                },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );

            alert("Holiday saved successfully.");
            navigate(0); // Refresh the page
        } catch (error) {
            console.error("Error saving holiday:", error);
            alert("Failed to save holiday.");
        }
    };

    // Handle holiday deletion
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this holiday?")) return;

        try {
            await axios.delete(`${config.API_URL}/api/holidays/delete/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            alert("Holiday deleted successfully.");
            navigate(0); // Refresh the page
        } catch (error) {
            console.error("Error deleting holiday:", error);
            alert("Failed to delete holiday.");
        }
    };

    // Populate form for editing
    const handleEdit = (holiday) => {
        setForm({
            id: holiday._id,
            name: holiday.name,
            date: holiday.date.split("T")[0], // Format for input[type="date"]
            isCompanyWide: holiday.isCompanyWide,
            applicableDepartments: holiday.applicableDepartments.map((d) => d._id),
            description: holiday.description,
        });
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-6 shadow-md rounded-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Holiday Management</h2>

            <form onSubmit={handleSubmit} className="mb-8 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Holiday Name</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Is Company-Wide?</label>
                    <select
                        name="isCompanyWide"
                        value={form.isCompanyWide}
                        onChange={(e) =>
                            setForm((prev) => ({
                                ...prev,
                                isCompanyWide: e.target.value === "true",
                                applicableDepartments: [],
                            }))
                        }
                        className="w-full px-4 py-2 border rounded-md"
                    >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>

                {!form.isCompanyWide && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Applicable Departments</label>
                        <div className="flex flex-wrap gap-2">
                            {departments.map((dep) => (
                                <label key={dep._id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        value={dep._id}
                                        checked={form.applicableDepartments.includes(dep._id)}
                                        onChange={handleChange}
                                    />
                                    <span>{dep.dep_name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md"
                    ></textarea>
                </div>

                <div className="flex space-x-4">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        {form.id ? "Update Holiday" : "Add Holiday"}
                    </button>
                    {form.id && (
                        <button
                            type="button"
                            onClick={() =>
                                setForm({
                                    id: null,
                                    name: "",
                                    date: "",
                                    isCompanyWide: true,
                                    applicableDepartments: [],
                                    description: "",
                                })
                            }
                            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>


            <h3 className="text-xl font-bold text-gray-800 mb-4">Existing Holidays</h3>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <table className="w-full border border-gray-200 rounded-md">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-left">Company-Wide</th>
                            <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {holidays.map((holiday) => (
                            <tr key={holiday._id}>
                                <td className="px-4 py-2">{holiday.name}</td>
                                <td className="px-4 py-2">{holiday.date.split("T")[0]}</td>
                                <td className="px-4 py-2">{holiday.isCompanyWide ? "Yes" : "No"}</td>
                                <td className="px-4 py-2">
                                    <button
                                        onClick={() => handleEdit(holiday)}
                                        className="mr-2 text-blue-500 hover:underline"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(holiday._id)}
                                        className="text-red-500 hover:underline"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default HolidayManagement;
