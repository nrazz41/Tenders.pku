// src/assets/pages/CartPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  User,
  Bell,
  FileText,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  Flame,
} from "lucide-react";
import { supabase } from "../../services/supabaseClient";

const PRIMARY_RED = "#B82329";

const CartPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalSelected, setTotalSelected] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Load user dari localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch(e) {}
    }
  }, []);

  // Fetch cart dari Supabase
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Hitung total setiap kali cartItems atau selectedItems berubah
  useEffect(() => {
    calculateTotal();
  }, [cartItems, selectedItems]);

  const fetchCart = async () => {
    setLoading(true);
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch cart items with product details
      const { data, error } = await supabase
        .from('carts')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      const items = data || [];
      setCartItems(items);
      
      // Initialize selected items
      const initialSelected = {};
      items.forEach(item => {
        initialSelected[item.id] = true;
      });
      setSelectedItems(initialSelected);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    let total = 0;
    let selected = 0;
    
    cartItems.forEach(item => {
      if (selectedItems[item.id]) {
        total += (item.products?.price || 0) * item.quantity;
        selected += item.quantity;
      }
    });
    
    setTotalPrice(total);
    setTotalSelected(selected);
  };

  const updateQuantity = async (cartId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    
    try {
      const { error } = await supabase
        .from('carts')
        .update({ quantity: newQty })
        .eq('id', cartId);

      if (error) throw error;
      
      // Update local state
      setCartItems(prev => prev.map(item => 
        item.id === cartId ? { ...item, quantity: newQty } : item
      ));
    } catch (error) {
      console.error("Failed to update quantity:", error);
      alert("Gagal mengupdate jumlah");
    }
  };

  const removeItem = async (cartId) => {
    if (!window.confirm("Hapus item dari keranjang?")) return;
    
    try {
      const { error } = await supabase
        .from('carts')
        .delete()
        .eq('id', cartId);

      if (error) throw error;
      
      setCartItems(prev => prev.filter(item => item.id !== cartId));
      setSelectedItems(prev => {
        const newSelected = { ...prev };
        delete newSelected[cartId];
        return newSelected;
      });
    } catch (error) {
      console.error("Failed to remove item:", error);
      alert("Gagal menghapus item");
    }
  };

  const toggleSelectItem = (cartId) => {
    setSelectedItems(prev => ({
      ...prev,
      [cartId]: !prev[cartId]
    }));
  };

  const toggleSelectAll = () => {
    const allSelected = cartItems.length > 0 && cartItems.every(item => selectedItems[item.id]);
    const newSelected = {};
    cartItems.forEach(item => {
      newSelected[item.id] = !allSelected;
    });
    setSelectedItems(newSelected);
  };

  const handleDeleteSelected = async () => {
    const selectedCartIds = cartItems.filter(item => selectedItems[item.id]).map(item => item.id);
    if (selectedCartIds.length === 0) {
      alert("Pilih produk yang ingin dihapus terlebih dahulu");
      return;
    }
    
    if (!window.confirm(`Hapus ${selectedCartIds.length} item dari keranjang?`)) return;
    
    try {
      for (const cartId of selectedCartIds) {
        await supabase
          .from('carts')
          .delete()
          .eq('id', cartId);
      }
      
      setCartItems(prev => prev.filter(item => !selectedItems[item.id]));
      setSelectedItems({});
    } catch (error) {
      console.error("Failed to delete items:", error);
      alert("Gagal menghapus item");
    }
  };

  const handleCheckout = () => {
    if (totalSelected === 0) {
      alert("Pilih minimal 1 produk untuk checkout");
      return;
    }
    navigate("/checkout");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate("/");
  };

  const formatCurrency = (value) => {
    const num = Number(value ?? 0);
    if (isNaN(num)) return "Rp 0";
    return `Rp ${num.toLocaleString("id-ID")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderBottomColor: PRIMARY_RED }}></div>
          <p className="text-gray-600">Memuat keranjang...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="w-full bg-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/images/Logo.png" 
                alt="Tenders PKU" 
                className="w-12 h-12 rounded-full border-2 object-cover" 
                style={{ borderColor: PRIMARY_RED }} 
              />
              <div>
                <span className="font-bold text-xl" style={{ color: PRIMARY_RED }}>TENDERS</span>
                <span className="font-bold text-xl text-gray-800"> PKU</span>
                <p className="text-xs text-gray-500 -mt-1">First Street Nashville Hot Chicken</p>
              </div>
            </Link>

            <div className="hidden lg:flex flex-1 max-w-md mx-4 relative">
              <input type="text" placeholder="Cari menu favoritmu..." className="w-full pl-4 pr-10 py-2 rounded-full bg-gray-100" />
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="flex items-center space-x-2">
              <Link to="/cart" className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gray-100" style={{ color: PRIMARY_RED }}>
                <ShoppingCart size={20} />
              </Link>

              <Link to="/riwayat-pesanan" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100" style={{ color: PRIMARY_RED }}>
                <FileText size={20} />
              </Link>

              <Link to="/notifications" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100" style={{ color: PRIMARY_RED }}>
                <Bell size={20} />
              </Link>

              {user ? (
                <div className="flex items-center space-x-2 ml-2">
                  <Link to="/profile" className="flex items-center gap-2 px-3 py-2 text-white rounded-full" style={{ backgroundColor: PRIMARY_RED }}>
                    <User size={16} />
                    <span>{user.full_name?.split(" ")[0] || user.email?.split("@")[0]}</span>
                  </Link>
                  <button onClick={handleLogout} className="w-10 h-10 rounded-full bg-gray-100 text-red-500">
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="ml-2 px-4 py-2 text-white rounded-full flex items-center gap-2" style={{ backgroundColor: PRIMARY_RED }}>
                  <User size={16} /> Login
                </Link>
              )}

              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden w-10 h-10 rounded-full bg-gray-100">
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4">
              <div className="flex flex-col space-y-3">
                <Link to="/" className="text-gray-700">Home</Link>
                <Link to="/menu" className="text-gray-700">Menu</Link>
                <Link to="/promo" className="text-gray-700">Promo</Link>
                <Link to="/location" className="text-gray-700">Location</Link>
                <Link to="/contact" className="text-gray-700">Contact</Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto w-full px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="text-gray-500 hover:red-500" style={{ hover: { color: PRIMARY_RED } }}>
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Keranjang Belanja</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${PRIMARY_RED}20` }}>
              <ShoppingCart size={40} style={{ color: PRIMARY_RED }} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Keranjang Kosong</h2>
            <p className="text-gray-500 mb-6">Belum ada produk di keranjang Anda</p>
            <Link to="/" className="px-6 py-3 text-white rounded-xl transition" style={{ backgroundColor: PRIMARY_RED }}>
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <>
            {/* TABLE HEADER */}
            <div className="bg-white rounded-t-2xl shadow-md overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b text-gray-600 text-sm font-semibold">
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 focus:ring-red-500"
                    style={{ accentColor: PRIMARY_RED }}
                    checked={cartItems.length > 0 && cartItems.every(item => selectedItems[item.id])}
                    onChange={toggleSelectAll}
                  />
                </div>
                <div className="col-span-5 md:col-span-6">Produk</div>
                <div className="col-span-2 text-center hidden md:block">Harga</div>
                <div className="col-span-2 text-center">Jumlah</div>
                <div className="col-span-2 text-right hidden md:block">Total</div>
                <div className="col-span-1 text-right"></div>
              </div>

              {/* CART ITEMS */}
              {cartItems.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 p-4 border-b transition" style={{ hover: { backgroundColor: `${PRIMARY_RED}10` } }}>
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 focus:ring-red-500"
                      style={{ accentColor: PRIMARY_RED }}
                      checked={selectedItems[item.id] || false}
                      onChange={() => toggleSelectItem(item.id)}
                    />
                  </div>
                  
                  <div className="col-span-5 md:col-span-6 flex gap-3">
                    <img
                      src={item.products?.image_url || "/images/default-product.png"}
                      alt={item.products?.name}
                      className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                      onError={(e) => { e.target.src = "/images/default-product.png"; }}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800">{item.products?.name}</h3>
                      <p className="text-xs text-gray-500">{item.products?.category}</p>
                      {item.products?.is_popular && (
                        <span className="inline-flex items-center gap-1 text-xs mt-1" style={{ color: PRIMARY_RED }}>
                          <Flame size={10} /> Best Seller
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-span-2 text-center hidden md:block">
                    <span className="font-semibold text-gray-800">{formatCurrency(item.products?.price)}</span>
                  </div>
                  
                  <div className="col-span-3 md:col-span-2 flex justify-center">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity, -1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-gray-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity, 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="col-span-2 text-right hidden md:block">
                    <span className="font-bold" style={{ color: PRIMARY_RED }}>
                      {formatCurrency((item.products?.price || 0) * item.quantity)}
                    </span>
                  </div>
                  
                  <div className="col-span-2 md:col-span-1 text-right">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* SUMMARY */}
            <div className="bg-white rounded-b-2xl shadow-md mt-4 p-5">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-500 transition"
                  >
                    <Trash2 size={18} /> Hapus yang Dipilih
                  </button>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-gray-500 text-sm">Total ({totalSelected} produk)</p>
                      <p className="text-2xl font-bold" style={{ color: PRIMARY_RED }}>{formatCurrency(totalPrice)}</p>
                    </div>
                    <button
                      onClick={handleCheckout}
                      disabled={totalSelected === 0}
                      className="px-8 py-3 text-white font-semibold rounded-xl transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: PRIMARY_RED }}
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* FOOTER */}
      <footer className="w-full bg-gray-900 text-white py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>© 2024 TENDERS PKU - First Street Nashville Hot Chicken</p>
          <p className="mt-2 text-gray-400">Jl. Hangtuah (Depan Plaza Kado), Pekanbaru</p>
        </div>
      </footer>
    </div>
  );
};

export default CartPage;