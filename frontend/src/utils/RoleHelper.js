import { useAuth } from "../context/authContext";

export const isAdmin = (user) => user.role === "admin";
export const isManager = (user) => user.role === "manager";
export const isEmployee = (user) => user.role === "employee";

export const getBasePath = () => {
    const { user } = useAuth();
    return user.role === "admin" ? "/admin-dashboard" : "/manager-dashboard";
  };
  