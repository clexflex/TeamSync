import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../../config";
import { Check, X, AlertCircle, User, Users } from "lucide-react";
import TaskDetailsModal from "../modal/TaskDetailsModal";

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

  const formatTime = (time) =>
    time
      ? new Date(time).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  const AttendanceTable = ({ records, title, icon: Icon }) => (
    <div className="mt-6">
      <div className="flex items-center mb-4">
        <Icon className="w-6 h-6 text-gray-700 mr-2" />
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {["Name", "Clock In", "Clock Out", "Hours", "Tasks", "Status", "Actions"].map(
                (header) => (
                  <th key={header} className="p-3 text-left text-gray-600 font-medium border">
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr
                key={record._id}
                className="border-b text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <td className="p-3 truncate border">{record.userId.name}</td>
                <td className="p-3 truncate border">{formatTime(record.clockIn)}</td>
                <td className="p-3 truncate border">{formatTime(record.clockOut)}</td>
                <td className="p-3 truncate border">{record.hoursWorked?.toFixed(2) || "-"}</td>
                <td className="p-3 truncate border">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => {
                      setSelectedRecord(record);
                      setIsModalOpen(true);
                    }}
                  >
                    View Tasks
                  </button>
                </td>
                <td className="p-3 border">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs ${
                      record.approvalStatus === "Approved"
                        ? "bg-green-100 text-green-700"
                        : record.approvalStatus === "Rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {record.approvalStatus}
                  </span>
                </td>
                <td className="p-3 flex space-x-2 border">
                  <button
                    className="p-2 bg-green-50 rounded-full hover:bg-green-100"
                    onClick={() => handleApproval(record._id, "Approved")}
                    disabled={record.approvalStatus === "Approved"}
                  >
                    <Check className="w-5 h-5 text-green-700" />
                  </button>
                  <button
                    className="p-2 bg-red-50 rounded-full hover:bg-red-100"
                    onClick={() => handleApproval(record._id, "Rejected")}
                    disabled={record.approvalStatus === "Rejected"}
                  >
                    <X className="w-5 h-5 text-red-700" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

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
              records={groupedAttendance.managers}
              title="Manager Attendance"
              icon={User}
            />
          )}
          {Object.entries(groupedAttendance.teams).map(([teamName, records]) => (
            <AttendanceTable
              key={teamName}
              records={records}
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
