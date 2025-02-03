// frontend/src/pages/NotFound.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const NotFound = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const handleNavigateBack = () => {
        if (user) {
          let dashboard;
          if (user.role === "admin") dashboard = "/admin-dashboard";
          else if (user.role === "manager") dashboard = "/manager-dashboard";
          else dashboard = "/employee-dashboard";
      
          navigate(dashboard);
        } else {
          navigate("/login");
        }
      };
      

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
            <div className="text-center max-w-md">
                {/* 404 Icon/Image */}
                <div className="mb-8">
                    <svg
                        className="mx-auto h-24 w-24 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>

                {/* Error Message */}
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
                <p className="text-lg text-gray-600 mb-2">
                    Oops! The page you're looking for doesn't exist.
                </p>
                <p className="text-gray-500 mb-8">
                    The URL <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{location.pathname}</span> could not be found.
                </p>

                {/* Action Buttons */}
                <div className="space-y-4">
                    <button
                        onClick={handleNavigateBack}
                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                        Return to Dashboard
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;