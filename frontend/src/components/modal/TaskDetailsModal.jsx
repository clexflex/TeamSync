import React from 'react';
import { X } from 'lucide-react';

const TaskDetailsModal = ({ isOpen, onClose, attendanceRecord }) => {
  if (!isOpen || !attendanceRecord) return null;

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Modal Panel */}
        <div className="relative inline-block p-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Task Details - {attendanceRecord.userId?.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {formatDate(attendanceRecord.date)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 transition-colors rounded-full hover:bg-gray-100 hover:text-gray-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="mt-4 space-y-4">
            {/* Time Information */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Clock In</p>
                <p className="font-medium text-gray-900">{formatTime(attendanceRecord.clockIn)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Clock Out</p>
                <p className="font-medium text-gray-900">
                  {attendanceRecord.clockOut ? formatTime(attendanceRecord.clockOut) : '-'}
                </p>
              </div>
            </div>

            {/* Work Details */}
            <div className="space-y-3 grid grid-cols-1 gap-4 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Work Location</span>
                <span className="px-3 py-1 text-sm text-blue-800 bg-blue-100 rounded-full">
                  {attendanceRecord.workLocation}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Hours Worked</span>
                <span className="text-sm font-medium text-gray-900">
                  {attendanceRecord.hoursWorked ? `${attendanceRecord.hoursWorked.toFixed(2)} hours` : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`px-3 py-1 text-sm rounded-full ${
                  attendanceRecord.approvalStatus === 'Approved' 
                    ? 'bg-green-100 text-green-800'
                    : attendanceRecord.approvalStatus === 'Rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {attendanceRecord.approvalStatus}
                </span>
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Tasks Completed</h4>
              <div className="p-4 text-gray-700 bg-gray-50 rounded-lg whitespace-pre-wrap">
                {attendanceRecord.tasksDone || 'No tasks recorded'}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-right">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;