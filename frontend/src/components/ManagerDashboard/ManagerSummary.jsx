// This component will provide a summary of key metrics for the manager, such as total teams, total members, and attendance stats.

import React, { useEffect, useState } from "react";
import axios from "axios";
import config from "../../config";

const ManagerSummary = () => {
  const [summary, setSummary] = useState({
    totalTeams: 0,
    totalMembers: 0,
    attendanceStats: {
      present: 0,
      absent: 0,
      leave: 0,
    },
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/api/dashboard/manager-summary`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.data.success) {
          setSummary(response.data.summary);
        }
      } catch (error) {
        alert("Failed to fetch summary.");
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      <div className="bg-white shadow-md p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-600">Total Teams</h3>
        <p className="text-2xl font-bold text-blue-600">{summary.totalTeams}</p>
      </div>
      <div className="bg-white shadow-md p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-600">Total Members</h3>
        <p className="text-2xl font-bold text-green-600">{summary.totalMembers}</p>
      </div>
      <div className="bg-white shadow-md p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-600">Attendance Stats</h3>
        <ul className="list-disc list-inside mt-2 text-gray-600">
          <li>Present: {summary.attendanceStats.present}</li>
          <li>Absent: {summary.attendanceStats.absent}</li>
          <li>Leave: {summary.attendanceStats.leave}</li>
        </ul>
      </div>
    </div>
  );
};

export default ManagerSummary;
