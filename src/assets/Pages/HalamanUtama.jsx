// src/assets/Pages/HalamanUtama.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  User,
  Bell,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Star,
  Clock,
  MapPin,
  Phone,
  Instagram,
  Facebook,
  Twitter,
  Menu,
  X,
  Flame,
  Package,
  Truck,
  Plus,
  Clock as ClockIcon,
  MapPin as MapPinIcon,
  Phone as PhoneIcon,
  Gift,
  Zap,
  TrendingUp,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getHomeData, getProducts, getCombos } from "../../services/api";

const API_URL = "http://127.0.0.1:8000/api";

// ============================================
// COMPONENT: Product Card
// ============================================
const ProductCard = ({ product, onAddToCart }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getSpiceIcon = (level) => {
    if (level === 0) return null;
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(level)].map((_, i) => (
          <Flame key={i} size={12} className="text-red-500" />
        ))}
      </div>
    );
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl border border-orange-100 flex flex-col h-full relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {product.is_popular && (
        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <Flame size={12} /> HOT
        </div>
      )}
      {product.is_new && (
        <div className="absolute top-3 left-3 z-10 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          NEW
        </div>
      )}

      <div className="relative overflow-hidden bg-orange-50 h-48">
        <img
          src={product.image_url || "/images/default-product.png"}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.src = "/images/default-product.png";
          }}
        />
        <button
          className={`absolute bottom-3 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 text-white text-xs px-3 py-1 rounded-full transition-all duration-300 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
          onClick={() => (window.location.href = `/product/${product.id}`)}
        >
          Quick View
        </button>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <div className="flex text-yellow-400">
              <Star size={14} fill="currentColor" />
              <Star size={14} fill="currentColor" />
              <Star size={14} fill="currentColor" />
              <Star size={14} fill="currentColor" />
              <Star size={14} fill="currentColor" />
            </div>
            <span className="text-xs text-gray-500">
              ({product.rating || 4.9})
            </span>
          </div>
          {getSpiceIcon(product.spice_level)}
        </div>

        <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">
          {product.name}
        </h3>

        <p className="text-gray-500 text-xs mb-3 line-clamp-2">
          {product.description ||
            "Chicken tender crispy dengan bumbu Nashville hot"}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-orange-600 font-bold text-xl">
              Rp {parseFloat(product.price).toLocaleString("id-ID")}
            </span>
            {product.original_price &&
              product.original_price > product.price && (
                <span className="text-gray-400 text-xs line-through ml-2">
                  Rp{" "}
                  {parseFloat(product.original_price).toLocaleString("id-ID")}
                </span>
              )}
          </div>
          <button
            onClick={() => onAddToCart && onAddToCart(product)}
            className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition-all duration-300 hover:scale-110 shadow-md"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENT: Combo Card (Paket Hemat)
// ============================================
const ComboCard = ({ combo, onOrderNow }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl border border-orange-200 flex flex-col h-full relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badge Diskon */}
      {combo.discount > 0 && (
        <div className="absolute top-3 right-3 z-10 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
          -{combo.discount}% OFF
        </div>
      )}

      {/* Image */}
      <div className="relative overflow-hidden bg-orange-100 h-52">
        <img
          src={combo.image_url || "/images/combo-default.png"}
          alt={combo.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.src = "/images/combo-default.png";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <Gift size={18} className="text-orange-500" />
          <h3 className="font-bold text-xl text-gray-800 line-clamp-1">
            {combo.name}
          </h3>
        </div>

        {/* <p className="text-gray-500 text-sm mb-3 line-clamp-2">
          {combo.items}
        </p> */}

        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-orange-600 font-bold text-2xl">
            Rp {parseFloat(combo.price).toLocaleString("id-ID")}
          </span>
          {combo.original_price && combo.original_price > combo.price && (
            <span className="text-gray-400 text-sm line-through">
              Rp {parseFloat(combo.original_price).toLocaleString("id-ID")}
            </span>
          )}
        </div>

        <button
          onClick={() => onOrderNow && onOrderNow(combo)}
          className="w-full mt-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
        >
          <Zap size={18} /> Pesan Sekarang
        </button>
      </div>
    </div>
  );
};

// ============================================
// COMPONENT: Testimonial Card
// ============================================
const TestimonialCard = ({ testimonial }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
          <User size={24} className="text-orange-500" />
        </div>
        <div>
          <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
          <div className="flex text-yellow-400">
            {[...Array(testimonial.rating || 5)].map((_, i) => (
              <Star key={i} size={14} fill="currentColor" />
            ))}
          </div>
        </div>
      </div>
      <p className="text-gray-600 italic">"{testimonial.comment}"</p>
      <p className="text-xs text-gray-400 mt-3">
        {testimonial.date || "Baru saja"}
      </p>
    </div>
  );
};

// ============================================
// MAIN COMPONENT: HomePage
// ============================================
const HomePage = () => {
  const navigate = useNavigate();

  // STATE UNTUK USER
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // STATE UNTUK NOTIFIKASI
  const [notificationCount, setNotificationCount] = useState(0);

  // States lainnya
  const [currentPage, setCurrentPage] = useState(1);
  const [currentBannerSlide, setCurrentBannerSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [combos, setCombos] = useState([]);
  const [featuredCombos, setFeaturedCombos] = useState([]);
  const [storeInfo, setStoreInfo] = useState({
    operational_hours: "15.00 - Sold Out",
    address: "Jl. Hangtuah (Depan Plaza Kado), Pekanbaru, Riau",
    phone: "+62 813 7823 7282",
    delivery_partners: ["GoFood", "ShopeeFood"],
  });
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const productsSectionRef = useRef(null);
  const productsPerPage = 8;

  // Fungsi fetch notifikasi
  const fetchNotificationCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get(
        `${API_URL}/notifications/unread-count`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data.success) {
        setNotificationCount(response.data.data.count);
      }
    } catch (error) {
      console.error("Failed to fetch notification count:", error);
    }
  };

  // BACA USER DARI LOCALSTORAGE DAN GET CART
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (token) {
          fetchCartFromAPI(token);
          fetchNotificationCount();
        }
      } catch (e) {
        console.error("Failed to parse user:", e);
      }
    }
    setLoading(false);
  }, []);

  // Refresh notifikasi setiap 10 detik
  useEffect(() => {
    if (user) {
      fetchNotificationCount();
      const interval = setInterval(fetchNotificationCount, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Fetch ALL data
  useEffect(() => {
    fetchAllData();
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (token) fetchCartFromAPI(token);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch cart dari database
  const fetchCartFromAPI = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        const totalItems =
          response.data.data?.items?.reduce(
            (sum, item) => sum + item.quantity,
            0,
          ) || 0;
        setCartCount(totalItems);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  const fetchAllData = async () => {
    try {
      // Fetch home data (banners, testimonials, store info)
      const homeRes = await getHomeData();
      if (homeRes.data.success) {
        setBanners(homeRes.data.data.banners || []);
        setTestimonials(homeRes.data.data.testimonials || []);
        if (homeRes.data.data.store_info) {
          setStoreInfo(homeRes.data.data.store_info);
        }
      }

      // Fetch combos (paket hemat)
      const combosRes = await getCombos();
      if (combosRes.data.success) {
        const activeCombos = combosRes.data.data.filter(
          (c) => c.is_active !== false,
        );
        setCombos(activeCombos);
        setFeaturedCombos(activeCombos.slice(0, 3));
      }

      // Fetch products
      await fetchProducts();
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  // Add to cart
  const handleAddToCart = async (product) => {
    if (!user) {
      alert("Silakan login terlebih dahulu");
      navigate("/login");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Session expired. Silakan login ulang.");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/cart`,
        {
          product_id: product.id,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        await fetchCartFromAPI(token);
        alert(`✅ ${product.name} ditambahkan ke keranjang!`);
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert("Gagal menambahkan ke keranjang");
    }
  };

  const handleOrderCombo = (combo) => {
    if (!user) {
      alert("Silakan login terlebih dahulu");
      navigate("/login");
      return;
    }
    // Redirect ke halaman checkout atau cart dengan data combo
    alert(`🛒 ${combo.name} akan ditambahkan ke keranjang!`);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setCartCount(0);
    navigate("/");
  };

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct,
  );
  const totalPages = Math.ceil(products.length / productsPerPage);

  // Auto slide banner
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentBannerSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="w-full bg-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/images/Logo.png"
                alt="Tenders PKU"
                className="w-12 h-12 rounded-full border-2 border-orange-500 object-cover"
              />
              <div>
                <span className="font-bold text-xl text-orange-600">
                  TENDERS
                </span>
                <span className="font-bold text-xl text-gray-800"> PKU</span>
                <p className="text-xs text-gray-500 -mt-1">
                  First Street Nashville Hot Chicken
                </p>
              </div>
            </Link>

            <div className="hidden lg:flex flex-1 max-w-md mx-4 relative">
              <input
                type="text"
                placeholder="Cari menu favoritmu..."
                className="w-full pl-4 pr-10 py-2 rounded-full bg-gray-100"
              />
              <Search
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Link
                to="/cart"
                className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-orange-600"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              <Link
                to="/riwayat-pesanan"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-orange-600"
              >
                <FileText size={20} />
              </Link>

              <Link
                to="/notification"
                className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-orange-600 hover:bg-orange-100 transition"
              >
                <Bell size={20} />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md animate-pulse">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="flex items-center space-x-2 ml-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-full"
                  >
                    <User size={16} />
                    <span>
                      {user.full_name?.split(" ")[0] || user.username}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-10 h-10 rounded-full bg-gray-100 text-red-500"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="ml-2 px-4 py-2 bg-orange-500 text-white rounded-full flex items-center gap-2"
                >
                  <User size={16} /> Login
                </Link>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden w-10 h-10 rounded-full bg-gray-100"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4">
              <div className="flex flex-col space-y-3">
                <Link to="/" className="text-gray-700">
                  Home
                </Link>
                <Link to="/menu" className="text-gray-700">
                  Menu
                </Link>
                <Link to="/promo" className="text-gray-700">
                  Promo
                </Link>
                <Link to="/location" className="text-gray-700">
                  Location
                </Link>
                <Link to="/contact" className="text-gray-700">
                  Contact
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* BANNER SLIDER */}
      {banners.length > 0 && (
        <section className="w-full max-w-7xl mx-auto mt-6 px-4">
          <div className="relative rounded-2xl overflow-hidden shadow-lg">
            <img
              src={banners[currentBannerSlide]?.image}
              alt="Banner"
              className="w-full h-64 md:h-80 object-cover"
            />
            <button
              onClick={() =>
                setCurrentBannerSlide(
                  (prev) => (prev - 1 + banners.length) % banners.length,
                )
              }
              className="absolute top-1/2 left-4 bg-black bg-opacity-40 text-white p-2 rounded-full"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() =>
                setCurrentBannerSlide((prev) => (prev + 1) % banners.length)
              }
              className="absolute top-1/2 right-4 bg-black bg-opacity-40 text-white p-2 rounded-full"
            >
              <ChevronRight size={24} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentBannerSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${currentBannerSlide === idx ? "bg-white w-6" : "bg-gray-400"}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* INFO STORE */}
      <section className="w-full max-w-7xl mx-auto mt-8 px-4">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <ClockIcon size={28} />
              <div>
                <h3 className="font-bold">Jam Operasional</h3>
                <p>{storeInfo.operational_hours}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <MapPinIcon size={28} />
              <div>
                <h3 className="font-bold">Lokasi</h3>
                <p>{storeInfo.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Truck size={28} />
              <div>
                <h3 className="font-bold">Delivery</h3>
                <p>{storeInfo.delivery_partners?.join(" & ")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      {/* HERO SECTION - BEST DEALS */}
<section className="w-full max-w-7xl mx-auto mt-12 px-4">
  <div className="text-center mb-8">
    <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
      🎉 <span className="text-orange-600">Paket Hemat</span> Spesial 🎉
    </h2>
    <p className="text-gray-500 mt-2">Dapatkan penawaran terbaik dengan harga lebih murah!</p>
  </div>
  
  {/* PAKAI INI - Grid 4 kolom dengan center */}
  <div className="flex justify-center">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-cols-max">
      {featuredCombos.map((combo) => (
        <ComboCard key={combo.id} combo={combo} onOrderNow={handleOrderCombo} />
      ))}
    </div>
  </div>
</section>
      {/* PRODUCTS SECTION */}
      <section
        ref={productsSectionRef}
        className="w-full max-w-7xl mx-auto mt-12 px-4 pb-12"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Menu Populer</h2>
            <p className="text-gray-500">Favorite customer hari ini</p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Belum ada produk</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-3 mt-10">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-orange-600 border border-orange-200 disabled:opacity-50 hover:bg-orange-50"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-gray-600">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-orange-600 border border-orange-200 disabled:opacity-50 hover:bg-orange-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="w-full bg-orange-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">
              Apa Kata Mereka?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.slice(0, 3).map((t) => (
                <TestimonialCard key={t.id} testimonial={t} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA SECTION */}
      <section className="w-full max-w-7xl mx-auto my-12 px-4">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Pesan Sekarang!</h2>
          <p className="mb-6 opacity-90">
            Nikmati kelezatan First Street Nashville Hot Chicken
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-orange-600 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition flex items-center gap-2">
              <Package size={20} /> GoFood
            </button>
            <button className="bg-white text-orange-600 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition flex items-center gap-2">
              <Package size={20} /> ShopeeFood
            </button>
            <button className="bg-white text-orange-600 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition flex items-center gap-2">
              <PhoneIcon size={20} /> Call Order
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/images/Logo.png"
                  alt="Tenders PKU"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <span className="font-bold text-lg text-orange-400">
                    TENDERS
                  </span>
                  <span className="font-bold text-lg"> PKU</span>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                First Street Nashville Hot Chicken pertama di Pekanbaru.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-orange-400">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/about" className="hover:text-orange-400">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="hover:text-orange-400">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-orange-400">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    to="/form-pengaduan"
                    className="hover:text-orange-400 flex items-center gap-2"
                  >
                  Form Pengaduan & Saran
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-orange-400">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <MapPinIcon size={14} /> {storeInfo.address}
                </li>
                <li className="flex items-center gap-2">
                  <PhoneIcon size={14} /> {storeInfo.phone}
                </li>
                <li className="flex items-center gap-2">
                  <ClockIcon size={14} /> {storeInfo.operational_hours}
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-orange-400">Follow Us</h3>
              <div className="flex space-x-4">
                <a
                  href="https://instagram.com/tenders.pku"
                  target="_blank"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition"
                >
                  <Twitter size={18} />
                </a>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-400">Delivery Partner:</p>
                <div className="flex gap-3 mt-2">
                  <span className="text-xs bg-gray-800 px-3 py-1 rounded-full">
                    GoFood
                  </span>
                  <span className="text-xs bg-gray-800 px-3 py-1 rounded-full">
                    ShopeeFood
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center text-gray-500 text-xs border-t border-gray-800 mt-8 pt-6">
            © 2024 TENDERS PKU - First Street Nashville Hot Chicken. All rights
            reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
