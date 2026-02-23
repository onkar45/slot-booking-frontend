import { createContext, useState, useContext } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    console.log('AuthContext - Stored user from localStorage:', storedUser);
    try {
      return storedUser && storedUser !== "undefined" && storedUser !== "null" 
        ? JSON.parse(storedUser) 
        : null;
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
      return null;
    }
  });

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password
    });
    
    console.log('Login response:', response.data);
    
    const { access_token, role: userRole, user: userData } = response.data;
    
    // If user data is not in the response, create it from email
    const userToStore = userData || { email, name: email.split('@')[0] };
    
    console.log('Storing user data:', userToStore);
    console.log('Storing role:', userRole);
    
    localStorage.setItem("token", access_token);
    localStorage.setItem("role", userRole);
    localStorage.setItem("user", JSON.stringify(userToStore));
    
    setRole(userRole);
    setUser(userToStore);
    
    return response.data;
  };

  const logout = () => {
    localStorage.clear();
    setRole(null);
    setUser(null);
  };

  console.log('AuthContext - Current state:', { role, user });

  return (
    <AuthContext.Provider value={{ role, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};