// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost/tenders_pku_api/api";
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Coba ambil dari localStorage dulu (agar tidak flicker saat reload)
    const savedUser = localStorage.getItem("tenders_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {}
    }
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/auth.php?action=check_session`,
        { withCredentials: true }
      );
      if (response.data?.logged_in === true) {
        setUser(response.data.data);
        localStorage.setItem("tenders_user", JSON.stringify(response.data.data));
      } else {
        // Session habis, bersihkan
        setUser(null);
        localStorage.removeItem("tenders_user");
      }
    } catch (error) {
      console.error("Session check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post(
        `${API_URL}/auth.php`,
        { action: "login", username, password },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );

      if (response.data?.success === true) {
        const userData = response.data.data;
        setUser(userData);
        // Simpan ke localStorage agar nama tetap tampil setelah refresh
        localStorage.setItem("tenders_user", JSON.stringify(userData));
        return {
          success: true,
          data: userData,
          role: userData.role, // "admin" atau "customer"
        };
      } else {
        return { success: false, error: response.data?.error || "Login gagal" };
      }
    } catch (error) {
      return { success: false, error: "Koneksi ke server gagal" };
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${API_URL}/auth.php`,
        { action: "logout" },
        { withCredentials: true }
      );
    } catch {}
    setUser(null);
    localStorage.removeItem("tenders_user");
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {/* Jangan render children sampai session selesai dicek */}
      {!loading && children}
    </AuthContext.Provider>
  );
};