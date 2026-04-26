// src/Pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // LANGSUNG PAKAI AXIOS, TIDAK LEWAT CONTEXT DULU
            const response = await axios.post('http://127.0.0.1:8000/api/login', {
                username: username,
                password: password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('RESPONSE:', response.data);

            if (response.data.success === true) {
                // Simpan token ke localStorage
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data));
                
                // Redirect berdasarkan role
                if (response.data.data.role === 'admin') {
                    window.location.href = '/dashboard';
                } else {
                    window.location.href = '/';
                }
            } else {
                setError(response.data.error || 'Login gagal');
            }
        } catch (error) {
            console.error('ERROR:', error);
            if (error.response) {
                setError(error.response.data?.error || 'Server error');
            } else if (error.request) {
                setError('Tidak dapat terhubung ke server. Pastikan backend berjalan di http://127.0.0.1:8000');
            } else {
                setError('Terjadi kesalahan: ' + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl font-bold text-orange-600">T</span>
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
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="admin"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition disabled:opacity-50"
                    >
                        {isLoading ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-500 text-sm">
                        Belum punya akun?{' '}
                        <Link to="/register" className="text-orange-500 font-semibold hover:underline">
                            Daftar Sekarang
                        </Link>
                    </p>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-xl text-center">
                    <p className="text-xs text-gray-500">Akun Demo: admin / admin123</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;