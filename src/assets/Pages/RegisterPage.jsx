// src/pages/SignupPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost/tenders_pku_api/api";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const displayMessageBox = (message, isError = true) => {
    const messageBox = document.createElement("div");
    messageBox.className =
      "fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50";
    messageBox.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4 text-center">
        <p class="text-lg ${isError ? "text-red-600" : "text-green-600"} mb-4">${message}</p>
        <button id="closeMessageBox" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">OK</button>
      </div>
    `;
    document.body.appendChild(messageBox);
    document.getElementById("closeMessageBox").onclick = () => {
      document.body.removeChild(messageBox);
    };
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      displayMessageBox("Password dan Konfirmasi Password tidak cocok!");
      return;
    }

    if (formData.password.length < 4) {
      displayMessageBox("Password minimal 4 karakter!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/auth.php`,
        {
          action: "register",
          username: formData.username,
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          phone: formData.phone,
        },
        { withCredentials: true },
      );

      if (response.data.success) {
        displayMessageBox("Pendaftaran berhasil! Silakan login.", false);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        displayMessageBox(response.data.error || "Pendaftaran gagal");
      }
    } catch (error) {
      console.error("Register error:", error);
      if (error.response && error.response.data) {
        displayMessageBox(error.response.data.error || "Registrasi gagal");
      } else {
        displayMessageBox("Koneksi ke server gagal");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen py-6 px-4 sm:px-6 lg:px-8 bg-gray-100">
      <div className="bg-orange-100 text-orange-800 text-center py-3 px-6 rounded-lg shadow-md mb-4 max-w-md w-full">
        Daftar Akun Baru
      </div>
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
        <div className="text-center mb-4">
          <img
            src="images\Logo.png"
            alt="Tenders PKU Logo"
            className="mx-auto mb-2 rounded-full w-20 h-20 object-cover"
            onError={(e) => {
              e.target.src = "https://placehold.co/80x80/orange/white?text=T";
            }}
          />
          <h2 className="text-xl font-bold text-orange-700">TENDERS PKU</h2>
          <p className="text-sm text-gray-500">Buat akun untuk memesan</p>
        </div>

        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <input
              type="text"
              name="full_name"
              placeholder="Nama Lengkap"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <div className="mb-3">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <div className="mb-3">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <div className="mb-3">
            <input
              type="tel"
              name="phone"
              placeholder="Nomor Telepon (opsional)"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div className="mb-3">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <div className="mb-4">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Konfirmasi Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-700">
          Sudah punya akun?{" "}
          <Link
            to="/signin"
            className="text-orange-600 font-semibold hover:underline"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
