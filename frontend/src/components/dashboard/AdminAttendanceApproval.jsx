import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../../config";
import { Check, X, AlertCircle, User, Users } from "lucide-react";
import TaskDetailsModal from "../modal/TaskDetailsModal";
import AttendanceTable from "../shared/AttendanceTable";

const AdminAttendanceApproval = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [groupedAttendance, setGroupedAttendance] = useState({
    managers: [],
    teams: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAllAttendance();
  }, [selectedDate]);

  const fetchAllAttendance = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.API_URL}/api/attendance/all`, {
        params: { date: selectedDate.toISOString() },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.data.success) {
        setAttendanceData(response.data.attendance || []);
        const grouped = { managers: [], teams: {} };
        response.data.attendance.forEach((record) => {
          if (record.role === "manager") {
            grouped.managers.push(record);
          } else {
            const teamName = record.teamId?.name || "Unassigned";
            if (!grouped.teams[teamName]) {
              grouped.teams[teamName] = [];
            }
            grouped.teams[teamName].push(record);
          }
        });
        setGroupedAttendance(grouped);
      }
    } catch (err) {
      setError("Failed to fetch attendance data");
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (attendanceId, status) => {
    try {
      await axios.put(
        `${config.API_URL}/api/attendance/approve`,
        { attendanceId, approvalStatus: status },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchAllAttendance();
    } catch {
      setError("Failed to update approval status");
    }
  };


  return (
    <div className="w-full p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Attendance Approval</h2>
        <input
          type="date"
          className="p-2 border rounded-md text-gray-600"
          value={selectedDate.toISOString().split("T")[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
        />
      </div>
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md mb-4 flex items-center">
          <AlertCircle className="w-6 h-6 mr-2" />
          {error}
        </div>
      )}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700"></div>
        </div>
      ) : (
        <>
          {groupedAttendance.managers.length > 0 && (
            <AttendanceTable
              records={groupedAttendance.managers.map(record => ({
                ...record,
                onApprove: handleApproval,
                onReject: handleApproval,
                onViewTasks: (record) => {
                  setSelectedRecord(record);
                  setIsModalOpen(true);
                }
              }))}
              title="Manager Attendance"
              icon={User}
            />
          )}
          {Object.entries(groupedAttendance.teams).map(([teamName, records]) => (
            <AttendanceTable
              key={teamName}
              records={records.map(record => ({
                ...record,
                onApprove: handleApproval,
                onReject: handleApproval,
                onViewTasks: (record) => {
                  setSelectedRecord(record);
                  setIsModalOpen(true);
                }
              }))}
              title={`${teamName} Team Attendance`}
              icon={Users}
            />
          ))}
        </>
      )}
      <TaskDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        attendanceRecord={selectedRecord}
      />
    </div>
  );
};

export default AdminAttendanceApproval;
