import React from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">You do not have permission to access this page.</p>
            <Link to="/login" className="text-blue-500">Return to Login</Link>
        </div>
    );
};

export default Unauthorized;
