import api from "./api";

interface LoginResponse {
  success: boolean;
  token?: string;
  role?: string;
  error?: string;
}

interface RegisterResponse {
  success: boolean;
  token?: string;
  role?: string;
  error?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "agent" | "associate" | "employee" | "end_user";
  phone?: string;
  isActive: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post("/auth/login", { email, password });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    }
  },

  async register(userData: RegisterData): Promise<RegisterResponse> {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Registration failed",
      };
    }
  },

  async loadUser(): Promise<User> {
    try {
      const response = await api.get("/auth/me");
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to load user");
    }
  },

  async forgotPassword(email: string): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      const response = await api.post("/auth/forgotpassword", { email });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to send reset email",
      };
    }
  },

  async resetPassword(token: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.put(`/auth/resetpassword/${token}`, { password });
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to reset password",
      };
    }
  },

  logout() {
    localStorage.removeItem("token");
  },
};





