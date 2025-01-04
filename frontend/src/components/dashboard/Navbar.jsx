import React, { useState } from 'react';
import { useAuth } from '../../context/authContext';
import LogoutModal from "../modal/LogoutModal";

const Navbar = () => {
    const { user, logout } = useAuth();
    const [isModalOpen, setModalOpen] = useState(false);

    const handleLogout = () => {
        setModalOpen(false);
        logout(); // Call the logout function from authContext
    };

    return (
        <div className='h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-10'>
            <div className='flex items-center space-x-4'>
                <p className='text-gray-700 font-medium'>
                    Welcome back, <span className='text-blue-600 font-semibold'>{user.name}</span>
                </p>
            </div>
            <button
                onClick={() => setModalOpen(true)}
                className='px-4 py-2 text-sm text-gray-700 hover:text-red-600 font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2'
            >
                Logout
            </button>
            <LogoutModal
                isOpen={isModalOpen}
                onConfirm={handleLogout}
                onCancel={() => setModalOpen(false)}
            />
        </div>
    );
};

export default Navbar;
