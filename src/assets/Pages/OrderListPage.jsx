// src/pages/OrderListPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, PackageX, ShoppingBag, Clock, MapPin, CreditCard } from 'lucide-react';

const API_URL = "http://127.0.0.1:8000/api";

const formatCurrency = (amount) => {
  const num = Number(amount ?? 0);
  if (isNaN(num)) return "Rp 0";
  return `Rp ${num.toLocaleString("id-ID")}`;
};

// Helper untuk styling status badge
const getStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'selesai':
      return 'bg-green-100 text-green-800';
    case 'processing':
    case 'diproses':
    case 'sedang diproses':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
    case 'dibatalkan':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Helper untuk teks status
const getStatusText = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed': return 'Selesai';
    case 'processing': return 'Diproses';
    case 'pending': return 'Pending';
    case 'cancelled': return 'Dibatalkan';
    default: return status || 'Unknown';
  }
};

const OrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Semua');
  const [user, setUser] = useState(null);

  const filterTabs = ['Semua', 'pending', 'processing', 'completed', 'cancelled'];
  const tabLabels = {
    'Semua': 'Semua',
    'pending': 'Pending',
    'processing': 'Diproses',
    'completed': 'Selesai',
    'cancelled': 'Dibatalkan'
  };

  // Load user dari localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch(e) {}
    }
  }, []);

  // Fetch orders dari API
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/orders`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      if (error.response?.status === 401) {
        console.log("Unauthorized, please login again");
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter orders berdasarkan status
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'Semua') return true;
    return order.status?.toLowerCase() === activeTab.toLowerCase();
  });

  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat pesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full bg-white py-4 px-4 md:px-8 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center relative">
          <Link to="/" className="absolute left-0 text-gray-800 hover:text-orange-500 transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-gray-800 text-center flex-grow">Riwayat Pesanan</h1>
        </div>
      </header>

      <main className="w-full max-w-4xl mx-auto p-4 md:p-6">
        {/* User Info */}
        {user && (
          <div className="bg-orange-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600">Hi, <span className="font-semibold text-orange-600">{user.full_name || user.username}</span></p>
            <p className="text-xs text-gray-500 mt-1">{user.email}</p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center flex-wrap gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
          {filterTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab 
                  ? 'border-b-2 border-orange-500 text-orange-600' 
                  : 'text-gray-500 hover:text-orange-600'
              }`}
            >
              {tabLabels[tab] || tab}
            </button>
          ))}
        </div>

        {/* Daftar Pesanan */}
        <div className="space-y-5">
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => {
              const firstItem = order.items?.[0];
              return (
                <div key={order.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                  {/* Card Header */}
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="text-orange-500" size={20} />
                      <div>
                        <p className="font-bold text-gray-800 text-sm">Order #{order.order_number}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Clock size={12} /> {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusBadge(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  {/* Card Body */}
                  <Link to={`/order/${order.id}`} className="block p-4 hover:bg-orange-50 transition">
                    <div className="flex items-center gap-4">
                      <img 
                        src={firstItem?.product?.image_url || "/images/default-product.png"} 
                        alt={firstItem?.product?.name || "Product"} 
                        className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                        onError={(e) => { e.target.src = "/images/default-product.png"; }}
                      />
                      <div className="flex-grow">
                        <p className="font-bold text-gray-900 leading-tight line-clamp-1">
                          {firstItem?.product?.name || "Produk"}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Qty: {firstItem?.quantity || 0} x {formatCurrency(firstItem?.price || 0)}
                        </p>
                        {order.items?.length > 1 && (
                          <p className="text-xs text-orange-500 mt-1">
                            +{order.items.length - 1} produk lainnya
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-600">{formatCurrency(order.total_amount)}</p>
                      </div>
                    </div>
                  </Link>
                  
                  {/* Card Footer */}
                  <div className="p-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {order.shipping_method === 'pickup' ? (
                        <span className="flex items-center gap-1"><MapPin size={14} /> Ambil Sendiri</span>
                      ) : (
                        <span className="flex items-center gap-1"><MapPin size={14} /> Dikirim</span>
                      )}
                      <span className="flex items-center gap-1"><CreditCard size={14} /> {order.payment_method || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link 
                        to={`/order/${order.id}`}
                        className="px-4 py-2 text-sm font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                      >
                        Detail
                      </Link>
                      <button className="px-4 py-2 text-sm font-semibold bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
                        Beli Lagi
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            // Empty State
            <div className="text-center py-16 bg-white rounded-xl">
              <PackageX className="mx-auto text-gray-300" size={64} />
              <h3 className="mt-4 text-xl font-bold text-gray-800">Belum Ada Pesanan</h3>
              <p className="mt-2 text-sm text-gray-500">Yuk, mulai pesan chicken tender favoritmu sekarang!</p>
              <Link to="/" className="mt-6 inline-block px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl shadow-md hover:bg-orange-600 transition">
                Mulai Belanja
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrderListPage;