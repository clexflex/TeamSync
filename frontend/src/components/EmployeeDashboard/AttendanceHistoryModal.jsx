import React from 'react';

const AttendanceHistoryModal = ({ attendance, onClose }) => {
  if (!attendance) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not recorded';
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) ?
      date.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'medium',
        timeZone: 'Asia/Kolkata'
      }) : 'Invalid Date';
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-transform duration-300 scale-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            Attendance Details - {formatDate(attendance.date)}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg transition-all duration-200 hover:shadow-md">
              <p className="font-medium text-gray-700">Clock In</p>
              <p className="text-gray-600">{formatDate(attendance.clockIn)}</p>
            </div>
            {attendance.clockOut && (
              <div className="bg-gray-50 p-4 rounded-lg transition-all duration-200 hover:shadow-md">
                <p className="font-medium text-gray-700">Clock Out</p>
                <p className="text-gray-600">{formatDate(attendance.clockOut)}</p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg transition-all duration-200 hover:shadow-md">
            <p className="font-medium text-gray-700">Approval Status</p>
            <p className={`capitalize ${attendance.approvalStatus === 'Approved' ? 'text-green-600' :
              attendance.approvalStatus === 'Rejected' ? 'text-red-600' :
              attendance.approvalStatus === 'Auto-Approved' ? 'text-blue-400' :
                'text-yellow-600'
              }`}>
              {attendance.approvalStatus || 'Pending'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
          {attendance.hoursWorked && (
              <div className="bg-gray-50 p-4 rounded-lg transition-all duration-200 hover:shadow-md">
                <p className="font-medium text-gray-700">Hours Worked</p>
                <p className="text-gray-600">{attendance.hoursWorked.toFixed(2) || 0} hours</p>
              </div>
            )}
            <div className="bg-gray-50 p-4 rounded-lg transition-all duration-200 hover:shadow-md">
              <p className="font-medium text-gray-700">Work Location</p>
              <p className="text-gray-600">{attendance.workLocation}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg transition-all duration-200 hover:shadow-md">
            <p className="font-medium text-gray-700">Status</p>
            <p className={`capitalize ${
              attendance.status === 'Present' ? 'text-green-600' :
              attendance.status === 'Absent' ? 'text-red-600' :
              attendance.status === 'Half-Day' ? 'text-yellow-600' :
              attendance.status === 'Leave' ? 'text-blue-600' :
              attendance.status === 'Extra-Work' ? 'text-indigo-600' :
                'text-gray-200'
              }`}>
              {attendance.status || 'No Status'}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg transition-all duration-200 hover:shadow-md">
            <p className="font-medium text-gray-700">Tasks Completed</p>
           
            <p className="text-gray-600">
              {attendance.tasksDone || 'NA'}
            </p>
            
          </div>
          
        </div>
      </div>
    </div>

  );
};

export default AttendanceHistoryModal;
