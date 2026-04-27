// src/assets/Pages/NotificationPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, Package, CheckCircle, Clock, XCircle, ArrowLeft, Trash2, Eye } from "lucide-react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchNotifications();
    // Polling setiap 5 detik untuk notifikasi baru
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(`${API_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const getIcon = (title) => {
    if (title.includes("Selesai")) return <CheckCircle className="text-green-500" size={24} />;
    if (title.includes("Diproses")) return <Clock className="text-blue-500" size={24} />;
    if (title.includes("Dibatalkan")) return <XCircle className="text-red-500" size={24} />;
    return <Package className="text-orange-500" size={24} />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Baru saja";
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    return `${days} hari lalu`;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="text-gray-600 hover:text-orange-500">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-800">Notifikasi</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-orange-500">{unreadCount} belum dibaca</p>
            )}
          </div>
          <Bell className="text-orange-500" size={24} />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">Belum ada notifikasi</p>
          </div>
        ) : (
          <>
            {unreadCount > 0 && (
              <div className="text-right mb-4">
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-orange-500 hover:underline"
                >
                  Tandai semua sudah dibaca
                </button>
              </div>
            )}
            
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.is_read && markAsRead(notif.id)}
                  className={`bg-white rounded-xl p-4 shadow-sm transition-all cursor-pointer ${
                    !notif.is_read ? "border-l-4 border-orange-500" : "opacity-80"
                  }`}
                >
                  <div className="flex gap-3">
                    {getIcon(notif.title)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{notif.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                      <Link
                        to={`/order/${notif.order_id}`}
                        className="text-xs text-orange-500 mt-2 inline-block hover:underline flex items-center gap-1"
                      >
                        <Eye size={12} /> Lihat detail pesanan
                      </Link>
                      <p className="text-xs text-gray-400 mt-2">{formatDate(notif.created_at)}</p>
                    </div>
                    {!notif.is_read && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default NotificationPage;