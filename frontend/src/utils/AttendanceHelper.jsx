export const calculateAttendanceStats = (attendanceRecords) => {
    const stats = { present: 0, absent: 0, leave: 0 };
    attendanceRecords.forEach((record) => {
      if (record.status === "Present") stats.present++;
      if (record.status === "Absent") stats.absent++;
      if (record.status === "Leave") stats.leave++;
    });
    return stats;
  };
  
  export const formatDate = (date) => new Date(date).toLocaleDateString();
  