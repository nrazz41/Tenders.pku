// src/Pages/ProductDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import {
  FaStar,
  FaChevronRight,
  FaMinus,
  FaPlus,
  FaFire,
  FaClock,
  FaTruck,
  FaShieldAlt,
} from "react-icons/fa";
import { ShoppingCart } from "lucide-react";
import { FiHeart } from "react-icons/fi";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  const [user, setUser] = useState(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Fetch product from Supabase
  useEffect(() => {
    fetchProduct();
    if (user) {
      fetchCartCount();
    }
  }, [id, user]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data) {
        setProduct(data);
        setMainImage(data.image_url || "/images/default-product.png");
      } else {
        setError("Produk tidak ditemukan");
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
      setError("Gagal memuat data produk");
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
    try {
      const { data, error } = await supabase
        .from('carts')
        .select('quantity')
        .eq('user_id', user?.id);

      if (error) throw error;
      
      const total = data?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      setCartCount(total);
    } catch (error) {
      console.error("Failed to fetch cart count:", error);
    }
  };

  const showAlert = (message, type = "success") => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  const formatCurrency = (value) => {
    const number = Number(value ?? 0);
    if (!isFinite(number) || isNaN(number)) return "Rp0";
    return `Rp ${number.toLocaleString("id-ID")}`;
  };

  const getSpiceLevelText = (level) => {
    if (level === 0) return "Tidak Pedas";
    if (level === 1) return "Mild (Sedang)";
    if (level === 2) return "Hot (Pedas)";
    if (level === 3) return "Extreme Hot (Sangat Pedas!)";
    return "Tidak Pedas";
  };

  const getSpiceIcon = (level) => {
    if (level === 0) return "🌶️";
    if (level === 1) return "🌶️";
    if (level === 2) return "🌶️🌶️";
    if (level === 3) return "🌶️🌶️🌶️🔥";
    return "";
  };

  const handleAddToCart = async () => {
    if (!user) {
      showAlert("Silakan login terlebih dahulu", "error");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }
    
    try {
      // Cek apakah produk sudah ada di cart
      const { data: existingCart, error: checkError } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      let result;
      if (existingCart) {
        // Update quantity
        result = await supabase
          .from('carts')
          .update({ quantity: existingCart.quantity + quantity })
          .eq('id', existingCart.id);
      } else {
        // Insert new cart item
        result = await supabase
          .from('carts')
          .insert([{
            user_id: user.id,
            product_id: product.id,
            quantity: quantity,
            price: product.price
          }]);
      }

      if (result.error) throw result.error;
      
      setCartCount(prev => prev + quantity);
      showAlert(`${quantity} x ${product.name} ditambahkan ke keranjang!`, "success");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      showAlert(error.message || "Gagal menambahkan ke keranjang", "error");
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      showAlert("Silakan login terlebih dahulu", "error");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }
    
    await handleAddToCart();
    setTimeout(() => navigate("/cart"), 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail produk...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🍗</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Produk Tidak Ditemukan</h1>
          <p className="text-gray-500 mb-6">{error || "Maaf, produk yang Anda cari tidak tersedia."}</p>
          <Link to="/" className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const discountPercent = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const subtotal = product.price * quantity;
  const originalSubtotal = product.original_price ? product.original_price * quantity : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Popup Notification */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className={`bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 transform animate-bounceIn border-t-8 ${popupType === 'success' ? 'border-green-500' : 'border-red-500'}`}>
            <div className="text-center">
              <div className={`mx-auto w-16 h-16 mb-4 rounded-full flex items-center justify-center ${popupType === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                {popupType === 'success' ? (
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                )}
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${popupType === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {popupType === 'success' ? 'Berhasil!' : 'Oops!'}
              </h3>
              <p className="text-gray-600">{popupMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-500">
            <Link to="/" className="hover:text-red-500">Home</Link>
            <FaChevronRight className="mx-2 text-xs" />
            <Link to="/menu" className="hover:text-red-500">Menu</Link>
            <FaChevronRight className="mx-2 text-xs" />
            <span className="text-red-500 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-200">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-96 object-cover"
                onError={(e) => {
                  e.target.src = "/images/default-product.png";
                }}
              />
              {product.is_popular && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <FaFire /> Best Seller
                </div>
              )}
              {discountPercent > 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{discountPercent}%
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Title & Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-yellow-400">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <span className="text-gray-600 ml-1">(4.9)</span>
                </div>
                <span className="text-gray-400">|</span>
                <span className="text-gray-500">Terjual 1.2rb+</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-red-50 rounded-2xl p-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-red-600">
                  {formatCurrency(product.price)}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <>
                    <span className="text-gray-400 line-through text-lg">
                      {formatCurrency(product.original_price)}
                    </span>
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      Hemat {discountPercent}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Deskripsi</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description || "Chicken tender crispy dengan bumbu khas Nashville Hot Chicken. Disajikan dengan saus pilihan dan kentang goreng crispy."}
              </p>
            </div>

            {/* Spice Level */}
            {product.category === "tender" && (
              <div className="flex items-center gap-4 py-3 border-t border-b border-gray-200">
                <span className="font-semibold text-gray-800">Level Pedas:</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getSpiceIcon(product.spice_level || 1)}</span>
                  <span className="text-gray-600">{getSpiceLevelText(product.spice_level || 1)}</span>
                </div>
              </div>
            )}

            {/* Stock Info */}
            <div className="flex items-center gap-2">
              <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `✓ Stok tersedia (${product.stock})` : '✗ Stok habis'}
              </span>
            </div>

            {/* Delivery Info */}
            <div className="bg-gray-100 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <FaTruck className="text-red-500" />
                <span className="text-gray-600">Pengiriman via GoFood & ShopeeFood</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FaClock className="text-red-500" />
                <span className="text-gray-600">Estimasi 15-30 menit</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FaShieldAlt className="text-red-500" />
                <span className="text-gray-600">Garansi kebersihan & keamanan makanan</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Jumlah Pesanan</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product.stock === 0}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition disabled:opacity-50"
                  >
                    <FaMinus />
                  </button>
                  <span className="w-12 text-center font-semibold text-gray-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock || product.stock === 0}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition disabled:opacity-50"
                  >
                    <FaPlus />
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  Stok tersisa: <span className="font-semibold text-red-600">{product.stock || 0}</span>
                </span>
              </div>
            </div>

            {/* Subtotal */}
            <div className="bg-red-50 rounded-2xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal ({quantity} item)</span>
                <div className="text-right">
                  {originalSubtotal && originalSubtotal > subtotal && (
                    <span className="text-sm text-gray-400 line-through block">
                      {formatCurrency(originalSubtotal)}
                    </span>
                  )}
                  <span className="text-2xl font-bold text-red-600">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Beli Langsung
              </button>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 py-4 border-2 border-red-500 text-red-600 font-bold rounded-xl hover:bg-red-50 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={18} /> Keranjang
              </button>
            </div>

            {/* Wishlist */}
            <button className="w-full py-3 text-gray-500 hover:text-red-500 transition flex items-center justify-center gap-2 border border-gray-200 rounded-xl">
              <FiHeart /> Tambahkan ke Wishlist
            </button>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-bounceIn {
          animation: bounceIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProductDetailPage;