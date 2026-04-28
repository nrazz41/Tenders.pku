// src/assets/Pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';

const PRIMARY_RED = "#B82329";

const LoginPage = () => {
  const [identifier, setIdentifier] = useState(''); // bisa username atau email
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Cari user berdasarkan username atau email
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`username.eq.${identifier.toLowerCase()},email.eq.${identifier.toLowerCase()}`)
        .single();

      if (error || !data) {
        setError('Username/Email atau password salah');
        setIsLoading(false);
        return;
      }

      // Verifikasi password (plain text dulu, nanti bisa upgrade ke bcrypt)
      if (data.password !== password) {
        setError('Username/Email atau password salah');
        setIsLoading(false);
        return;
      }

      // Simpan user ke localStorage (tanpa password)
      const userData = {
        id: data.id,
        username: data.username,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        membership: data.membership,
      };
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', `fake-token-${data.id}`);

      if (data.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error("Login error:", error);
      setError('Username/Email atau password salah');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 to-orange-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <img src="/images/Logo.png" w-25 alt="" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">TENDERS PKU</h1>
          <p className="text-gray-500 text-sm">First Street Nashville Hot Chicken</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl text-center text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username atau Email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="username atau email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 text-white font-semibold rounded-xl transition disabled:opacity-50"
            style={{ backgroundColor: PRIMARY_RED }}
          >
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Belum punya akun?{' '}
            <Link to="/register" className="font-semibold hover:underline" style={{ color: PRIMARY_RED }}>
              Daftar Sekarang
            </Link>
          </p>
        </div>

        {/* <div className="mt-4 p-3 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500 font-semibold mb-2">🔐 AKUN DEMO:</p>
          <p className="text-xs text-gray-500">👑 Admin: admin / admin123</p>
          <p className="text-xs text-gray-500">👤 Customer: customer / customer123</p>
        </div> */}
      </div>
    </div>
  );
};

export default LoginPage;