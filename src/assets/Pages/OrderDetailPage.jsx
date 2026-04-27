// src/assets/Pages/OrderDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MapPin, ClipboardList, PackageSearch, Truck, Home, CreditCard, Calendar, Store } from 'lucide-react';

const API_URL = "http://127.0.0.1:8000/api";

const formatCurrency = (amount) => {
  const num = Number(amount ?? 0);
  if (isNaN(num)) return "Rp 0";
  return `Rp ${num.toLocaleString('id-ID')}`;
};

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

// Status steps berdasarkan database
const statusSteps = [
  { id: 'pending', name: 'Pending', icon: ClipboardList, text: 'Menunggu Konfirmasi' },
  { id: 'processing', name: 'Processing', icon: PackageSearch, text: 'Diproses' },
  { id: 'completed', name: 'Completed', icon: Truck, text: 'Selesai' },
  { id: 'cancelled', name: 'Cancelled', icon: Home, text: 'Dibatalkan' }
];

const getStatusText = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'Menunggu Konfirmasi';
    case 'processing': return 'Sedang Diproses';
    case 'completed': return 'Selesai';
    case 'cancelled': return 'Dibatalkan';
    default: return status || 'Unknown';
  }
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'processing': return 'bg-blue-100 text-blue-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Order Status Tracker Component
const OrderStatusTracker = ({ currentStatus }) => {
  const statusOrder = ['pending', 'processing', 'completed'];
  const currentIndex = statusOrder.indexOf(currentStatus?.toLowerCase());
  
  if (currentStatus?.toLowerCase() === 'cancelled') {
    return (
      <div className="p-4 bg-red-50 rounded-lg text-center">
        <p className="text-red-600 font-semibold">Pesanan telah dibatalkan</p>
      </div>
    );
  }
  
  return (
    <div className="flex items-center w-full px-4 py-6">
      {statusOrder.map((status, index) => {
        const isActive = index <= currentIndex;
        const step = statusSteps.find(s => s.id === status);
        if (!step) return null;
        
        return (
          <React.Fragment key={status}>
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-orange-500' : 'bg-gray-300'}`}>
                <step.icon size={20} className="text-white" />
              </div>
              <p className={`mt-2 text-xs font-semibold transition-colors duration-500 ${isActive ? 'text-orange-600' : 'text-gray-500'}`}>
                {step.text}
              </p>
            </div>
            {index < statusOrder.length - 1 && (
              <div className="flex-1 h-1 mx-2 relative">
                <div className="absolute top-0 left-0 h-full w-full bg-gray-300 rounded-full" />
                <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${isActive ? 'bg-orange-500' : 'bg-gray-300'}`} 
                     style={{ width: isActive && index < currentIndex ? '100%' : '0%' }} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/orders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const orderData = response.data.data;
        setOrder(orderData);
        
        // Parse shipping address jika ada
        if (orderData.shipping_address) {
          try {
            setAddress(JSON.parse(orderData.shipping_address));
          } catch(e) {
            setAddress({ street: orderData.shipping_address });
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch order detail:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail pesanan...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Pesanan tidak ditemukan</p>
          <Link to="/riwayat-pesanan" className="text-orange-500 hover:underline">Kembali ke Riwayat</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full bg-white py-4 px-4 md:px-8 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center relative">
          <Link to="/riwayat-pesanan" className="absolute left-0 text-gray-800 hover:text-orange-500 transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-gray-800 text-center flex-grow">Detail Pesanan</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Order Info Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <p className="text-sm text-gray-500">Order #{order.order_number}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Calendar size={14} /> {formatDate(order.created_at)}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </div>
          </div>
        </div>

        {/* Status Tracker */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-bold text-lg text-gray-800 mb-4">Status Pesanan</h2>
          <OrderStatusTracker currentStatus={order.status} />
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-600">
              {order.status === 'pending' && 'Pesanan Anda sedang menunggu konfirmasi dari penjual'}
              {order.status === 'processing' && 'Pesanan Anda sedang diproses, akan segera dikirim'}
              {order.status === 'completed' && 'Pesanan telah selesai. Terima kasih telah berbelanja!'}
              {order.status === 'cancelled' && 'Pesanan telah dibatalkan'}
            </p>
          </div>
        </div>

        {/* Shipping/Pickup Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
            {order.shipping_method === 'pickup' ? <Store size={20} /> : <MapPin size={20} />}
            {order.shipping_method === 'pickup' ? 'Ambil Sendiri' : 'Alamat Pengiriman'}
          </h2>
          
          {order.shipping_method === 'pickup' ? (
            <div className="text-gray-700">
              <p className="font-semibold">📍 Lokasi Pengambilan:</p>
              <p>Jl. Hangtuah (Depan Plaza Kado)</p>
              <p>Pekanbaru, Riau</p>
              <p className="text-sm text-green-600 mt-2">✓ Siap diambil setelah status "Selesai"</p>
            </div>
          ) : (
            address && (
              <div className="text-gray-700">
                <p className="font-semibold">{address.recipient || 'Customer'}</p>
                <p>{address.phone || '-'}</p>
                <p>{address.street}, {address.city || 'Pekanbaru'}</p>
              </div>
            )
          )}
        </div>

        {/* Products */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-bold text-lg text-gray-800 mb-4">Produk yang Dipesan</h2>
          <div className="space-y-4">
            {order.items?.map((item) => (
              <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                <img 
                  src={item.product?.image_url || "/images/default-product.png"} 
                  alt={item.product?.name} 
                  className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                  onError={(e) => { e.target.src = "/images/default-product.png"; }}
                />
                <div className="flex-grow">
                  <p className="font-semibold text-gray-800">{item.product?.name}</p>
                  <p className="text-sm text-gray-500">Jumlah: {item.quantity}</p>
                  <p className="text-sm text-gray-500">{formatCurrency(item.price)} / item</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-600">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard size={20} /> Ringkasan Pembayaran
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-800">{formatCurrency(order.total_amount)}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-3 mt-2">
              <span className="font-bold text-gray-800">Total</span>
              <span className="font-bold text-orange-600 text-xl">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <CreditCard size={14} /> Metode Pembayaran: {order.payment_method || '-'}
            </p>
            {order.notes && (
              <p className="text-sm text-gray-500 mt-2">Catatan: {order.notes}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          {order.status !== 'completed' && order.status !== 'cancelled' && (
            <button className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition">
              Hubungi Penjual
            </button>
          )}
          <Link to="/" className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition text-center">
            Belanja Lagi
          </Link>
        </div>
      </main>
    </div>
  );
};

export default OrderDetailPage;