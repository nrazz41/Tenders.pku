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
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getHomeData, getProducts, getCategories, getCombos } from "../../services/api";

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
            <span className="text-xs text-gray-500">({product.rating || 4.9})</span>
          </div>
          {getSpiceIcon(product.spice_level)}
        </div>

        <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">
          {product.name}
        </h3>

        <p className="text-gray-500 text-xs mb-3 line-clamp-2">
          {product.description || "Chicken tender crispy dengan bumbu Nashville hot"}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-orange-600 font-bold text-xl">
              Rp {parseFloat(product.price).toLocaleString("id-ID")}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-gray-400 text-xs line-through ml-2">
                Rp {parseFloat(product.original_price).toLocaleString("id-ID")}
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
// COMPONENT: Category Card
// ============================================
const MenuCategoryCard = ({ category, onClick, isActive }) => {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col items-center p-4 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer border ${
        isActive
          ? "bg-orange-500 text-white border-orange-500"
          : "bg-white border-orange-100 hover:border-orange-300"
      }`}
    >
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
          isActive ? "bg-white/20" : "bg-orange-100 group-hover:bg-orange-200"
        }`}
      >
        <img
          src={category.icon || "/images/default-category.png"}
          alt={category.name}
          className="w-10 h-10 object-contain"
          onError={(e) => {
            e.target.src = "/images/default-category.png";
          }}
        />
      </div>
      <p className={`font-semibold text-center text-sm ${isActive ? "text-white" : "text-gray-800"}`}>
        {category.name}
      </p>
      <p className={`text-xs mt-1 ${isActive ? "text-white/70" : "text-gray-400"}`}>
        {category.count} menu
      </p>
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
      <p className="text-xs text-gray-400 mt-3">{testimonial.date || "Baru saja"}</p>
    </div>
  );
};

// ============================================
// MAIN COMPONENT: HomePage
// ============================================
const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // States
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentBannerSlide, setCurrentBannerSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [combos, setCombos] = useState([]);
  const [storeInfo, setStoreInfo] = useState({
    operational_hours: "15.00 - Sold Out",
    address: "Jl. Hangtuah (Depan Plaza Kado), Pekanbaru, Riau",
    phone: "+62 813 7823 7282",
    delivery_partners: ["GoFood", "ShopeeFood"],
  });
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const productsSectionRef = useRef(null);
  const productsPerPage = 8;

  // Fetch all data from API
  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch products when category changes
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchAllData = async () => {
    setLoading(true);
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

      // Fetch categories
      const categoriesRes = await getCategories();
      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.data);
      }

      // Fetch combos
      const combosRes = await getCombos();
      if (combosRes.data.success) {
        setCombos(combosRes.data.data);
      }

      // Fetch products
      await fetchProducts();
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const params = {};
      if (selectedCategory !== "all") {
        params.category = selectedCategory;
      }
      const response = await getProducts(params);
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const handleAddToCart = (product) => {
    if (!user) {
      navigate("/login", { state: { from: "/" } });
      return;
    }
    setCartCount((prev) => prev + 1);
    alert(`${product.name} ditambahkan ke keranjang!`);
  };

  const handleCategoryFilter = (categoryValue) => {
    setSelectedCategory(categoryValue);
    setCurrentPage(1);
  };

  const handleLogout = async () => {
    await logout();
    setCartCount(0);
    navigate("/");
  };

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
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
          <p className="text-gray-600">Memuat menu favorit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-gray-50">
      {/* ========== HEADER ========== */}
      <header className="w-full bg-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/images/Logo.png"
                alt="Tenders PKU"
                className="w-12 h-12 rounded-full border-2 border-orange-500 object-cover"
                onError={(e) => {
                  e.target.src = "https://placehold.co/48x48/orange/white?text=T";
                }}
              />
              <div>
                <span className="font-bold text-xl text-orange-600">TENDERS</span>
                <span className="font-bold text-xl text-gray-800"> PKU</span>
                <p className="text-xs text-gray-500 -mt-1">First Street Nashville Hot Chicken</p>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-md mx-4 relative">
              <input
                type="text"
                placeholder="Cari menu favoritmu..."
                className="w-full pl-4 pr-10 py-2 rounded-full bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Link to="/cart" className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-orange-600 hover:bg-orange-100 transition">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              <Link to="/orders" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-orange-600 hover:bg-orange-100 transition">
                <FileText size={20} />
              </Link>

              <Link to="/notifications" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-orange-600 hover:bg-orange-100 transition">
                <Bell size={20} />
              </Link>

              {/* User Menu / Login Button */}
              {user ? (
                <div className="flex items-center space-x-2 ml-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition"
                  >
                    <User size={16} />
                    <span className="text-sm font-semibold">
                      {user.full_name?.split(" ")[0] || user.username}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-red-500 hover:bg-red-100 transition"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="ml-2 px-4 py-2 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition flex items-center gap-2"
                >
                  <User size={16} />
                  <span>Login</span>
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-gray-100"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4">
              <div className="flex flex-col space-y-3">
                <Link to="/" className="text-gray-700 hover:text-orange-600 py-2" onClick={() => setIsMenuOpen(false)}>Home</Link>
                <Link to="/menu" className="text-gray-700 hover:text-orange-600 py-2" onClick={() => setIsMenuOpen(false)}>Menu</Link>
                <Link to="/promo" className="text-gray-700 hover:text-orange-600 py-2" onClick={() => setIsMenuOpen(false)}>Promo</Link>
                <Link to="/location" className="text-gray-700 hover:text-orange-600 py-2" onClick={() => setIsMenuOpen(false)}>Location</Link>
                <Link to="/contact" className="text-gray-700 hover:text-orange-600 py-2" onClick={() => setIsMenuOpen(false)}>Contact</Link>
                <div className="relative">
                  <input type="text" placeholder="Cari menu..." className="w-full pl-4 pr-10 py-2 rounded-full bg-gray-100" />
                  <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ========== BANNER SLIDER ========== */}
      {banners.length > 0 && (
        <section className="w-full max-w-7xl mx-auto mt-6 px-4">
          <div className="relative rounded-2xl overflow-hidden shadow-lg">
            <img
              src={banners[currentBannerSlide]?.image}
              alt={banners[currentBannerSlide]?.title || "Banner"}
              className="w-full h-64 md:h-80 object-cover transition-opacity duration-500"
              onError={(e) => {
                e.target.src = "https://placehold.co/1280x400/orange/white?text=TENDERS+PKU";
              }}
            />
            <button
              onClick={() => setCurrentBannerSlide((prev) => (prev - 1 + banners.length) % banners.length)}
              className="absolute top-1/2 left-4 -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-60 text-white p-2 rounded-full transition"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => setCurrentBannerSlide((prev) => (prev + 1) % banners.length)}
              className="absolute top-1/2 right-4 -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-60 text-white p-2 rounded-full transition"
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

      {/* ========== INFO STORE ========== */}
      <section className="w-full max-w-7xl mx-auto mt-8 px-4">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-full"><ClockIcon size={28} /></div>
              <div><h3 className="font-bold text-lg">Jam Operasional</h3><p className="text-sm opacity-90">{storeInfo.operational_hours}</p><p className="text-xs opacity-75">Setiap Hari</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-full"><MapPinIcon size={28} /></div>
              <div><h3 className="font-bold text-lg">Lokasi</h3><p className="text-sm opacity-90">{storeInfo.address}</p><p className="text-xs opacity-75">Pekanbaru, Riau</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-full"><Truck size={28} /></div>
              <div><h3 className="font-bold text-lg">Delivery</h3><p className="text-sm opacity-90">{storeInfo.delivery_partners?.join(" & ")}</p><p className="text-xs opacity-75">Pesan Online Sekarang!</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== MENU CATEGORIES ========== */}
      <section className="w-full max-w-7xl mx-auto mt-12 px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Menu Categories</h2>
          <p className="text-gray-500 mt-2">Pilih kategori menu favoritmu</p>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((category, idx) => (
            <MenuCategoryCard
              key={idx}
              category={category}
              isActive={selectedCategory === category.value}
              onClick={() => handleCategoryFilter(category.value)}
            />
          ))}
        </div>
      </section>

      {/* ========== COMBO PACKAGES ========== */}
      {combos.length > 0 && (
        <section className="w-full max-w-7xl mx-auto mt-12 px-4">
          <div className="flex justify-between items-center mb-6">
            <div><h2 className="text-3xl font-bold text-gray-800">Paket Hemat</h2><p className="text-gray-500">Lebih hemat dengan paket combo</p></div>
            <Link to="/promo" className="text-orange-600 font-medium hover:text-orange-700 flex items-center gap-1">Lihat Semua <ChevronRight size={16} /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {combos.map((combo) => (
              <div key={combo.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition border border-orange-100">
                <div className="relative">
                  <img src={combo.image} alt={combo.name} className="w-full h-48 object-cover" onError={(e) => { e.target.src = "https://placehold.co/400x300/orange/white?text=Combo"; }} />
                  <div className="absolute top-3 right-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">Save {combo.discount}</div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-xl text-gray-800">{combo.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{combo.items}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-orange-600 font-bold text-xl">Rp {combo.price.toLocaleString("id-ID")}</span>
                    <span className="text-gray-400 text-sm line-through">Rp {combo.original_price.toLocaleString("id-ID")}</span>
                  </div>
                  <button className="w-full mt-4 bg-orange-500 text-white py-2 rounded-xl font-semibold hover:bg-orange-600 transition">Pesan Sekarang</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========== PRODUCTS SECTION ========== */}
      <section ref={productsSectionRef} className="w-full max-w-7xl mx-auto mt-12 px-4 pb-12">
        <div className="flex justify-between items-center mb-6">
          <div><h2 className="text-3xl font-bold text-gray-800">Menu Populer</h2><p className="text-gray-500">Favorite customer hari ini</p></div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Belum ada produk tersedia</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-3 mt-10">
                <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-orange-600 border border-orange-200 disabled:opacity-50 hover:bg-orange-50">
                  <ChevronLeft size={20} />
                </button>
                <span className="text-gray-600">Halaman {currentPage} dari {totalPages}</span>
                <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-orange-600 border border-orange-200 disabled:opacity-50 hover:bg-orange-50">
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ========== TESTIMONIALS ========== */}
      {testimonials.length > 0 && (
        <section className="w-full bg-orange-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Apa Kata Mereka?</h2>
              <p className="text-gray-500 mt-2">Testimoni dari pelanggan setia Tenders PKU</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.slice(0, 3).map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== CTA SECTION ========== */}
      <section className="w-full max-w-7xl mx-auto my-12 px-4">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Pesan Sekarang!</h2>
          <p className="mb-6 opacity-90">Nikmati kelezatan First Street Nashville Hot Chicken</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-orange-600 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition flex items-center gap-2"><Package size={20} /> GoFood</button>
            <button className="bg-white text-orange-600 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition flex items-center gap-2"><Package size={20} /> ShopeeFood</button>
            <button className="bg-white text-orange-600 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition flex items-center gap-2"><PhoneIcon size={20} /> Call Order</button>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="w-full bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/images/Logo.png" alt="Tenders PKU" className="w-10 h-10 rounded-full object-cover" onError={(e) => { e.target.src = "https://placehold.co/40x40/orange/white?text=T"; }} />
                <div><span className="font-bold text-lg text-orange-400">TENDERS</span><span className="font-bold text-lg"> PKU</span></div>
              </div>
              <p className="text-sm text-gray-400">First Street Nashville Hot Chicken pertama di Pekanbaru. Chicken tender crispy dengan bumbu khas Nashville.</p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-orange-400">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/about" className="hover:text-orange-400">About Us</Link></li>
                <li><Link to="/faq" className="hover:text-orange-400">FAQ</Link></li>
                <li><Link to="/contact" className="hover:text-orange-400">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-orange-400">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2"><MapPinIcon size={14} /> {storeInfo.address}</li>
                <li className="flex items-center gap-2"><PhoneIcon size={14} /> {storeInfo.phone}</li>
                <li className="flex items-center gap-2"><ClockIcon size={14} /> {storeInfo.operational_hours}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-orange-400">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="https://instagram.com/tenders.pku" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition"><Instagram size={18} /></a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition"><Facebook size={18} /></a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition"><Twitter size={18} /></a>
              </div>
              <div className="mt-4"><p className="text-sm text-gray-400">Delivery Partner:</p><div className="flex gap-3 mt-2"><span className="text-xs bg-gray-800 px-3 py-1 rounded-full">GoFood</span><span className="text-xs bg-gray-800 px-3 py-1 rounded-full">ShopeeFood</span></div></div>
            </div>
          </div>
          <div className="text-center text-gray-500 text-xs border-t border-gray-800 mt-8 pt-6">© 2024 TENDERS PKU - First Street Nashville Hot Chicken. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;