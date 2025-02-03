// frontend/src/pages/Login.jsx
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { useNavigate, useLocation } from 'react-router-dom';
import config from '../config';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberEmail: false
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check for remembered email
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setFormData(prev => ({
                ...prev,
                email: rememberedEmail,
                rememberEmail: true
            }));
        }

        // Clear any existing error when component mounts
        setError(null);
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user starts typing
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                `${config.API_URL}/api/auth/login`,
                { email: formData.email, password: formData.password },
                { withCredentials: true }
            );

            if (response.data.success) {
                // Handle "Remember Email" functionality
                if (formData.rememberEmail) {
                    localStorage.setItem('rememberedEmail', formData.email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }

                // Store token and login
                localStorage.setItem('token', response.data.token);
                login(response.data.user);

                // Redirect based on role
                const redirectPath =
                    response.data.user.role === "admin"
                        ? "/admin-dashboard"
                        : response.data.user.role === "manager"
                            ? "/manager-dashboard"
                            : "/employee-dashboard";


                // Navigate to the intended page or default dashboard
                const intendedPath = location.state?.from || redirectPath;
                navigate(intendedPath, { replace: true });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error ||
                'Unable to connect to the server. Please try again later.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Brand Section */}
            <div className="hidden lg:flex lg:w-1/2 bg-blue-600 items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white">TeamSync</h1>
                    <p className="text-blue-100 mt-2">Streamline Your Workforce Management</p>
                    <div className="mt-8">
                        <div className="w-32 h-1 bg-blue-400 mx-auto rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    <div className="lg:hidden text-center mb-8">
                        <h1 className="text-3xl font-bold text-blue-600">TeamSync</h1>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Sign in to your account</h2>

                    {error && (
                        <div className="mb-4 p-3 text-red-500 rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                                placeholder="name@company.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                autoComplete="current-password"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="rememberEmail"
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={formData.rememberEmail}
                                    onChange={handleChange}
                                />
                                <span className="ml-2 text-sm text-gray-600">Remember email</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full ${isLoading
                                    ? 'bg-blue-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                } text-white py-3 rounded-lg transition-all duration-200 font-medium flex items-center justify-center`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </>
                            ) : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;