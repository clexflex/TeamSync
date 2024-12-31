import React from 'react';

const DashboardLayout = ({ children }) => {
  return (
    <div className='p-8 pt-24 bg-gray-50 min-h-screen'>
      <div className='max-w-7xl mx-auto'>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;