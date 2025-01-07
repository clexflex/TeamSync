import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/authContext";
import config from "../../config";

const ViewSalary = () => {
    const [salaries, setSalaries] = useState(null);
    const [filteredSalaries, setFilteredSalaries] = useState(null);
    const { id } = useParams();
    let sno = 1;
    const { user } = useAuth()

    const fetchSalaries = async () => {
        try {
            const response = await axios.get(`${config.API_URL}/api/salary/${id}/${user.role}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            console.log(response.data);
            if (response.data.success) {
                setSalaries(response.data.salary);
                setFilteredSalaries(response.data.salary);
            }
        } catch (error) {
            alert(error.message);
        }
    };

    useEffect(() => {
        fetchSalaries();
    }, []);

    const filterSalaries = (q) => {
        const filteredRecords = salaries.filter((salary) =>
            salary.employeeId.employeeId.toLowerCase().includes(q.toLowerCase())
        );
        setFilteredSalaries(filteredRecords);
    };



    const handleSort = (field) => {
        const sortedRecords = [...filteredSalaries].sort((a, b) => {
            if (field === "payDate") {
                return new Date(a.payDate) - new Date(b.payDate);
            } else if (field === "netSalary") {
                return b.netSalary - a.netSalary; // Descending order
            }
            return 0;
        });
        setFilteredSalaries(sortedRecords);
    };
    return (
        <div className="bg-white rounded-lg shadow-sm max-w-4xl mx-auto p-6">
            {filteredSalaries === null ? (
                <div>Loading...</div>
            ) : (
                <>
                    <div className="text-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Salary History</h2>
                    </div>
                    <div className="flex justify-end mb-4">
                        <input
                            type="text"
                            placeholder="Search By Emp ID"
                            className="border px-2 rounded-md py-1 border-gray-300"
                            onChange={(e) => filterSalaries(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end mb-4">
                        <select
                            className="border px-2 py-1 rounded-md border-gray-300"
                            onChange={(e) => handleSort(e.target.value)}
                        >
                            <option value="">Sort By</option>
                            <option value="payDate">Pay Date</option>
                            <option value="netSalary">Net Salary</option>
                        </select>
                    </div>
                    {filteredSalaries.length > 0 ? (
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border border-gray-200">
                                <tr>
                                    <th className="px-6 py-3">SNO</th>
                                    <th className="px-6 py-3">Emp ID</th>
                                    <th className="px-6 py-3">Salary</th>
                                    <th className="px-6 py-3">Allowance</th>
                                    <th className="px-6 py-3">Deduction</th>
                                    <th className="px-6 py-3">Total</th>
                                    <th className="px-6 py-3">Pay Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSalaries.map((salary) => (
                                    <tr
                                        key={salary._id}
                                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                    >
                                        <td className="px-6 py-3">{sno++}</td>
                                        <td className="px-6 py-3">
                                            {salary.employeeId ? salary.employeeId.employeeId : "N/A"}
                                        </td>
                                        <td className="px-6 py-3">{salary.basicSalary}</td>
                                        <td className="px-6 py-3">{salary.allowances}</td>
                                        <td className="px-6 py-3">{salary.deductions}</td>
                                        <td className="px-6 py-3">{salary.netSalary}</td>
                                        <td className="px-6 py-3">
                                            {new Date(salary.payDate).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div>No Records</div>
                    )}
                </>
            )}
        </div>
    );
};

export default ViewSalary;
