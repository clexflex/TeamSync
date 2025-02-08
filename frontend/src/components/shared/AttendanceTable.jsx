import React, { useState } from 'react';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';

const AttendanceTable = ({ records, title, icon: Icon }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const formatTime = (time) =>
    time
      ? new Date(time).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  return (
    <div className="mt-6">
      <div className="flex items-center mb-4">
        {Icon && <Icon className="w-6 h-6 text-gray-700 mr-2" />}
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left text-gray-600 font-medium border">Employee</th>
              <th className="p-3 text-left text-gray-600 font-medium border">Time</th>
              <th className="p-3 text-left text-gray-600 font-medium border">Status</th>
              <th className="p-3 text-left text-gray-600 font-medium border">Actions</th>
              <th className="p-3 text-left text-gray-600 font-medium border w-8"></th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <React.Fragment key={record._id}>
                <tr className="border-b text-gray-700 hover:bg-gray-50">
                  <td className="p-3 border">
                    <div className="font-medium">{record.userId.name}</div>
                    <div className="text-sm text-gray-500">{record.workLocation}</div>
                    {record.workLocation === "Remote" && record.location && (
                      <div className="text-xs text-gray-500">
                        Location: Lat {record.location.latitude}, Lon {record.location.longitude}
                      </div>
                    )}
                  </td>
                  <td className="p-3 border">
                    <div className="space-y-1">
                      <div className="text-sm">
                        In: {formatTime(record.clockIn)}
                      </div>
                      <div className="text-sm">
                        Out: {formatTime(record.clockOut)}
                      </div>
                      <div className="text-sm font-medium">
                        Hours: {record.hoursWorked?.toFixed(2) || "-"}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 border">
                    <div className="space-y-2">
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
                    </div>
                  </td>
                  <td className="p-3 border">
                    <div className="flex space-x-2">
                      <button
                        className="p-2 bg-green-50 rounded-full hover:bg-green-100"
                        onClick={() => record.onApprove?.(record._id, "Approved")}
                        disabled={record.approvalStatus === "Approved"}
                      >
                        <Check className="w-5 h-5 text-green-700" />
                      </button>
                      <button
                        className="p-2 bg-red-50 rounded-full hover:bg-red-100"
                        onClick={() => record.onReject?.(record._id, "Rejected")}
                        disabled={record.approvalStatus === "Rejected"}
                      >
                        <X className="w-5 h-5 text-red-700" />
                      </button>
                    </div>
                  </td>
                  <td className="p-3 border">
                    <button
                      onClick={() => toggleRow(record._id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {expandedRows.has(record._id) ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                </tr>
                {expandedRows.has(record._id) && (
                  <tr className="bg-gray-50">
                    <td colSpan="5" className="p-4 border">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Approval Status</h4>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  record.managerApproval
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {record.managerApproval
                                  ? "Approved by Manager"
                                  : "Pending Manager"}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  record.adminApproval
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {record.adminApproval
                                  ? "Approved by Admin"
                                  : "Pending Admin"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Additional Info</h4>
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium">Comments:</span>
                              <p className="text-sm text-gray-600">
                                {record.comments || "No comments"}
                              </p>
                            </div>
                            <div>
                              <button
                                onClick={() => record.onViewTasks?.(record)}
                                className="text-blue-600 hover:underline text-sm"
                              >
                                View Tasks
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export default AttendanceTable;