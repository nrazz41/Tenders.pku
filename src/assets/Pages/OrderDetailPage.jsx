// src/assets/Pages/OrderDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { 
  ArrowLeft, MapPin, ClipboardList, PackageSearch, Truck, 
  Home, CreditCard, Calendar, Store, Star, X, Send 
} from 'lucide-react';

const PRIMARY_RED = "#B82329";

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

// Status steps
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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-red-500' : 'bg-gray-300'}`}>
                <step.icon size={20} className="text-white" />
              </div>
              <p className={`mt-2 text-xs font-semibold transition-colors duration-500 ${isActive ? 'text-red-600' : 'text-gray-500'}`}>
                {step.text}
              </p>
            </div>
            {index < statusOrder.length - 1 && (
              <div className="flex-1 h-1 mx-2 relative">
                <div className="absolute top-0 left-0 h-full w-full bg-gray-300 rounded-full" />
                <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${isActive ? 'bg-red-500' : 'bg-gray-300'}`} 
                     style={{ width: isActive && index < currentIndex ? '100%' : '0%' }} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Testimoni Modal Component - Background Transparan
const TestimoniModal = ({ isOpen, onClose, onSubmit, orderId }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Silakan pilih rating bintang');
      return;
    }
    setSubmitting(true);
    await onSubmit(rating, comment);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-lg">Berikan Penilaian</h3>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-1 rounded-full transition">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4 bg-transparent">
          <div className="text-center">
            <p className="text-gray-600 mb-2">Seberapa puas dengan pesanan Anda?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    size={32}
                    className={`${
                      (hoverRating || rating) >= star
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {rating === 5 && 'Sangat Puas! 🎉'}
              {rating === 4 && 'Puas 😊'}
              {rating === 3 && 'Cukup 😐'}
              {rating === 2 && 'Kurang Puas 😕'}
              {rating === 1 && 'Tidak Puas 😞'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Komentar (Opsional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none bg-white/80"
              placeholder="Ceritakan pengalaman Anda..."
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md"
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <><Send size={18} /> Kirim Testimoni</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showTestimoniModal, setShowTestimoniModal] = useState(false);
  const [hasTestimoni, setHasTestimoni] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch(e) {}
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrderDetail();
      checkExistingTestimoni();
    }
  }, [id, user]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (orderError) throw orderError;
      
      setOrder(orderData);

      if (orderData) {
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            *,
            products (*)
          `)
          .eq('order_id', orderData.id);

        if (itemsError) throw itemsError;
        setOrderItems(itemsData || []);
      }
    } catch (error) {
      console.error("Failed to fetch order detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingTestimoni = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('id')
        .eq('order_id', id)
        .maybeSingle();

      if (error) throw error;
      setHasTestimoni(!!data);
    } catch (error) {
      console.error("Failed to check testimoni:", error);
    }
  };

  const handleSubmitTestimoni = async (rating, comment) => {
  try {
    const storedUser = localStorage.getItem('user');
    const userData = storedUser ? JSON.parse(storedUser) : null;

    const { error } = await supabase
      .from('testimonials')
      .insert([{
        order_id: parseInt(id),
        name: userData?.full_name || userData?.email?.split('@')[0] || 'Pelanggan',
        rating: rating,
        comment: comment || '',
        is_active: true,
        created_at: new Date()
      }]);

    if (error) throw error;

    alert('Terima kasih atas testimoni Anda! ⭐');
    setShowTestimoniModal(false);
    setHasTestimoni(true);
  } catch (error) {
    console.error("Failed to submit testimoni:", error);
    alert('Gagal mengirim testimoni: ' + error.message);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderBottomColor: PRIMARY_RED }}></div>
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
          <Link to="/riwayat-pesanan" className="hover:underline" style={{ color: PRIMARY_RED }}>Kembali ke Riwayat</Link>
        </div>
      </div>
    );
  }

  const isCompleted = order.status?.toLowerCase() === 'completed';
  const canGiveTestimoni = isCompleted && !hasTestimoni;

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Testimoni Modal */}
      <TestimoniModal
        isOpen={showTestimoniModal}
        onClose={() => setShowTestimoniModal(false)}
        onSubmit={handleSubmitTestimoni}
        orderId={id}
      />

      {/* Header */}
      <header className="w-full bg-white py-4 px-4 md:px-8 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center relative">
          <Link to="/riwayat-pesanan" className="absolute left-0 text-gray-800 transition hover:text-red-500">
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
            {order.source === 'offline' ? <Store size={20} /> : <MapPin size={20} />}
            {order.source === 'offline' ? 'Ambil Sendiri' : 'Pengiriman'}
          </h2>
          
          {order.source === 'offline' ? (
            <div className="text-gray-700">
              <p className="font-semibold">📍 Lokasi Pengambilan:</p>
              <p>Jl. Hangtuah (Depan Plaza Kado)</p>
              <p>Pekanbaru, Riau</p>
              <p className="text-sm text-green-600 mt-2">✓ Siap diambil setelah status "Selesai"</p>
            </div>
          ) : (
            <div className="text-gray-700">
              <p className="font-semibold">{order.customer_name || user?.full_name || 'Customer'}</p>
              <p>Jl. Hangtuah (Depan Plaza Kado), Pekanbaru</p>
              <p className="text-sm text-gray-500 mt-2">Pengiriman via GoFood/ShopeeFood</p>
            </div>
          )}
        </div>

        {/* Products */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-bold text-lg text-gray-800 mb-4">Produk yang Dipesan</h2>
          <div className="space-y-4">
            {orderItems.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Tidak ada produk</p>
            ) : (
              orderItems.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                  <img 
                    src={item.products?.image_url || "/images/default-product.png"} 
                    alt={item.products?.name} 
                    className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                    onError={(e) => { e.target.src = "/images/default-product.png"; }}
                  />
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-800">{item.products?.name || 'Produk'}</p>
                    <p className="text-sm text-gray-500">Jumlah: {item.quantity}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(item.price)} / item</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{ color: PRIMARY_RED }}>{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
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
              <span className="font-bold text-xl" style={{ color: PRIMARY_RED }}>{formatCurrency(order.total_amount)}</span>
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

        {/* Testimoni Section */}
        {canGiveTestimoni && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-6 border border-yellow-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Star className="fill-yellow-400 text-yellow-400" size={20} />
                  Bagikan Pengalaman Anda
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Beri rating dan testimoni untuk pesanan ini
                </p>
              </div>
              <button
                onClick={() => setShowTestimoniModal(true)}
                className="px-5 py-2 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 transition flex items-center gap-2"
              >
                <Star size={16} /> Beri Testimoni
              </button>
            </div>
          </div>
        )}

        {hasTestimoni && isCompleted && (
          <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-200 text-center">
            <p className="text-green-700 text-sm flex items-center justify-center gap-2">
              <Star className="fill-green-500 text-green-500" size={16} />
              Terima kasih atas testimoni Anda!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          {order.status !== 'completed' && order.status !== 'cancelled' && (
            <button className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition">
              Hubungi Penjual
            </button>
          )}
          <Link to="/" className="flex-1 py-3 text-white rounded-xl font-semibold transition text-center" style={{ backgroundColor: PRIMARY_RED }}>
            Belanja Lagi
          </Link>
        </div>
      </main>
    </div>
  );
};

export default OrderDetailPage;