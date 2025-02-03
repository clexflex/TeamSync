// frontend/src/context/authContext.jsx
import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';
import config from '../config';

const userContext = createContext();

const AuthContext = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Configure axios defaults
    axios.defaults.withCredentials = true;

    const verifyUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            const response = await axios.get(
                `${config.API_URL}/api/auth/verify`,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setUser(response.data.user);
            } else {
                setUser(null);
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error('Auth verification error:', error);
            setUser(null);
            localStorage.removeItem('token');
            setError(error.response?.data?.error || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        verifyUser();
    }, []);

    // Axios response interceptor for handling 401 errors
    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                setUser(null);
                localStorage.removeItem('token');
                // Only redirect if not already on login page
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
            return Promise.reject(error);
        }
    );

    const login = (userData) => {
        setUser(userData);
        setError(null);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        // Clear any remembered credentials
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
    };

    return (
        <userContext.Provider value={{ 
            user, 
            login, 
            logout, 
            loading,
            error,
            verifyUser // Expose verifyUser for manual verification if needed
        }}>
            {children}
        </userContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(userContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthContext provider');
    }
    return context;
};

export default AuthContext;