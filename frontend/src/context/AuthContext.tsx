import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "@/services/authService";
import { toast } from "sonner";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "agent" | "employee" | "end_user";
  phone?: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      const userData = await authService.loadUser();
      setUser(userData);
      setError(null);
    } catch (err: any) {
      console.error("Load user error:", err);
      setError(err.message || "Failed to load user");
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(email, password);
      
      if (response.success && response.token) {
        setToken(response.token);
        localStorage.setItem("token", response.token);
        
        // Load user data after successful login
        const userData = await authService.loadUser();
        setUser(userData);
        
        toast.success("Login successful!");
      } else {
        throw new Error(response.error || "Login failed");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Login failed";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(userData);
      
      if (response.success && response.token) {
        setToken(response.token);
        localStorage.setItem("token", response.token);
        
        // Load user data after successful registration
        const user = await authService.loadUser();
        setUser(user);
        
        toast.success("Registration successful!");
      } else {
        throw new Error(response.error || "Registration failed");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Registration failed";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setError(null);
    toast.success("Logged out successfully");
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    register,
    logout,
    loadUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
