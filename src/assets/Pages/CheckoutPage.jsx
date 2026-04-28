// src/assets/Pages/CheckoutPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  User,
  Bell,
  ChevronRight,
  CreditCard,
  CheckCircle,
  Wallet,
  Landmark,
  Building,
  X,
  Store,
  LogOut,
  Search,
  Menu,
} from "lucide-react";
import { supabase } from "../../services/supabaseClient";

const PRIMARY_RED = "#B82329";

const formatCurrency = (value) => {
  const num = Number(value ?? 0);
  if (isNaN(num)) return "Rp 0";
  return `Rp ${num.toLocaleString("id-ID")}`;
};

// Modal Sukses
const SuccessModal = ({ isOpen, onClose, onViewOrder }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center transform transition-all">
        <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900">Pesanan Berhasil!</h3>
        <p className="text-gray-600 text-sm mt-2 mb-6">
          Terima kasih telah berbelanja di TENDERS PKU!
        </p>
        <button
          onClick={onViewOrder}
          className="w-full px-4 py-2 text-white rounded-lg font-semibold"
          style={{ backgroundColor: PRIMARY_RED }}
        >
          Lihat Detail Pesanan
        </button>
        <button
          onClick={onClose}
          className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState({
    group: "ewallet",
    option: "gopay",
  });

  const paymentOptions = {
    ewallet: [
      { id: "gopay", name: "GoPay", icon: "💚" },
      { id: "ovo", name: "OVO", icon: "💜" },
      { id: "dana", name: "DANA", icon: "💙" },
      { id: "shopeepay", name: "ShopeePay", icon: "🛒" },
      { id: "qris", name: "QRIS", icon: "📱" },
    ],
    bank: [
      { id: "bca", name: "BCA", icon: "🏦" },
      { id: "mandiri", name: "Mandiri", icon: "🏦" },
      { id: "bri", name: "BRI", icon: "🏦" },
      { id: "bni", name: "BNI", icon: "🏦" },
    ],
  };

  // Load user dari localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {}
    }
  }, []);

  // Fetch cart ONLY setelah user tersedia
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [user]); // <-- DEPENDENCY user, bukan array kosong!

  const fetchCart = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("carts")
        .select(
          `
          *,
          products (*)
        `,
        )
        .eq("user_id", user.id);

      if (error) throw error;

      const items = data || [];
      setCartItems(items);

      const initialSelected = {};
      items.forEach((item) => {
        initialSelected[item.id] = true;
      });
      setSelectedItems(initialSelected);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedCartItems = () => {
    return cartItems.filter((item) => selectedItems[item.id]);
  };

  const selectedProducts = getSelectedCartItems();
  const subtotal = selectedProducts.reduce(
    (sum, item) => sum + (item.products?.price || 0) * item.quantity,
    0,
  );

  const serviceFee = 1000;
  const totalPayment = subtotal + serviceFee;

  const handlePlaceOrder = async () => {
    if (selectedProducts.length === 0) {
      alert("Tidak ada produk yang dipilih");
      return;
    }

    if (!user) {
      alert("Silakan login terlebih dahulu");
      navigate("/login");
      return;
    }

    try {
      // Format payment method
      let paymentMethodValue = "";
      if (selectedPayment.group === "ewallet") {
        const ewalletNames = {
          gopay: "GoPay",
          ovo: "OVO",
          dana: "DANA",
          shopeepay: "ShopeePay",
          qris: "QRIS",
        };
        paymentMethodValue =
          ewalletNames[selectedPayment.option] || selectedPayment.option;
      } else if (selectedPayment.group === "bank") {
        const bankNames = {
          bca: "BCA",
          mandiri: "Mandiri",
          bri: "BRI",
          bni: "BNI",
        };
        paymentMethodValue =
          bankNames[selectedPayment.option] || selectedPayment.option;
      } else {
        paymentMethodValue = "COD";
      }

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // PASTIKAN user.id adalah NUMBER/INTEGER, bukan STRING
      // Di handlePlaceOrder
      const userId = user?.id ? Number(user.id) : null;

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            order_number: orderNumber,
            user_id: userId, // ← pastikan ini number, bukan null
            customer_name: user.full_name || user.email?.split("@")[0],
            total_amount: totalPayment,
            payment_method: paymentMethodValue,
            source: "offline",
            status: "pending",
            notes: "Pickup di toko",
            created_at: new Date(),
            updated_at: new Date(),
          },
        ])
        .select();
      if (orderError) {
        console.error("Order error:", orderError);
        throw orderError;
      }

      // Simpan ke tabel order_items
      for (const item of selectedProducts) {
        const { error: itemError } = await supabase.from("order_items").insert([
          {
            order_id: orderData[0].id,
            product_id: Number(item.product_id), // ← Pastikan number juga
            quantity: item.quantity,
            price: item.products?.price,
            created_at: new Date(),
          },
        ]);

        if (itemError) throw itemError;
      }

      // Hapus item dari cart
      for (const item of selectedProducts) {
        await supabase.from("carts").delete().eq("id", item.id);
      }

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Failed to place order:", error);
      alert("Gagal memproses pesanan: " + error.message);
    }
  };

  const handleViewOrder = () => {
    setShowSuccessModal(false);
    navigate("/riwayat-pesanan");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div
          className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4"
          style={{ borderBottomColor: PRIMARY_RED }}
        ></div>
      </div>
    );
  }

  return (
    <>
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onViewOrder={handleViewOrder}
      />

      <div className="bg-gray-50 min-h-screen font-sans">
        {/* HEADER */}
        <header className="w-full bg-white shadow-md sticky top-0 z-40">
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
                  <span
                    className="font-bold text-xl"
                    style={{ color: PRIMARY_RED }}
                  >
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
                  className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gray-100"
                  style={{ color: PRIMARY_RED }}
                >
                  <ShoppingCart size={20} />
                </Link>
                <Link
                  to="/notifications"
                  className="w-10 h-10 rounded-full bg-gray-100"
                  style={{ color: PRIMARY_RED }}
                >
                  <Bell size={20} />
                </Link>

                {user ? (
                  <div className="flex items-center space-x-2 ml-2">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-3 py-2 text-white rounded-full"
                      style={{ backgroundColor: PRIMARY_RED }}
                    >
                      <User size={16} />
                      <span>
                        {user.full_name?.split(" ")[0] ||
                          user.email?.split("@")[0]}
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
                    className="ml-2 px-4 py-2 text-white rounded-full flex items-center gap-2"
                    style={{ backgroundColor: PRIMARY_RED }}
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
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center justify-center text-sm text-gray-400 mb-8">
            <span>Keranjang</span>
            <ChevronRight size={16} className="mx-2" />
            <span className="font-bold" style={{ color: PRIMARY_RED }}>
              Checkout
            </span>
            <ChevronRight size={16} className="mx-2" />
            <span>Pembayaran</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Pickup Info */}
              <div
                className="p-6 rounded-xl border"
                style={{
                  backgroundColor: `${PRIMARY_RED}10`,
                  borderColor: PRIMARY_RED,
                }}
              >
                <h2 className="text-xl font-bold text-gray-800 flex items-center mb-4">
                  <Store
                    className="mr-3"
                    size={24}
                    style={{ color: PRIMARY_RED }}
                  />
                  Ambil Sendiri (Pickup)
                </h2>
                <div className="text-gray-700">
                  <p className="font-semibold">📍 Lokasi Pengambilan:</p>
                  <p>Jl. Hangtuah (Depan Plaza Kado)</p>
                  <p>Pekanbaru, Riau</p>
                  <p className="text-sm text-green-600 mt-2">
                    ✓ Siap dalam 10-15 menit setelah pesanan dikonfirmasi
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    ⚠️ Harap bawa bukti pesanan saat mengambil
                  </p>
                  <div
                    className="mt-4 p-3 bg-white rounded-lg border"
                    style={{ borderColor: `${PRIMARY_RED}30` }}
                  >
                    <p
                      className="text-sm font-semibold mb-2"
                      style={{ color: PRIMARY_RED }}
                    >
                      🛵 Pengiriman via Aplikasi Partner:
                    </p>
                    <div className="flex gap-3">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        GoFood
                      </span>
                      <span
                        className="px-3 py-1 text-white rounded-full text-xs font-semibold"
                        style={{ backgroundColor: PRIMARY_RED }}
                      >
                        ShopeeFood
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Untuk pengiriman, silakan pesan melalui aplikasi GoFood
                      atau ShopeeFood
                    </p>
                  </div>
                </div>
              </div>

              {/* Metode Pembayaran */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <CreditCard
                    className="mr-3"
                    size={24}
                    style={{ color: PRIMARY_RED }}
                  />
                  Metode Pembayaran
                </h2>
                <div className="space-y-3">
                  <div
                    className={`p-4 border rounded-xl cursor-pointer transition ${
                      selectedPayment.group === "ewallet"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200"
                    }`}
                    style={
                      selectedPayment.group === "ewallet"
                        ? {
                            borderColor: PRIMARY_RED,
                            backgroundColor: `${PRIMARY_RED}10`,
                          }
                        : {}
                    }
                    onClick={() =>
                      setSelectedPayment({ group: "ewallet", option: "gopay" })
                    }
                  >
                    <p className="font-bold text-gray-800 flex items-center">
                      <Wallet className="mr-3 text-blue-500" size={20} />{" "}
                      E-Wallet / QRIS
                    </p>
                    {selectedPayment.group === "ewallet" && (
                      <div className="mt-4 pl-8">
                        <select
                          value={selectedPayment.option}
                          onChange={(e) =>
                            setSelectedPayment({
                              ...selectedPayment,
                              option: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded-lg focus:ring-orange-500"
                        >
                          {paymentOptions.ewallet.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.icon} {opt.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <div
                    className={`p-4 border rounded-xl cursor-pointer transition ${
                      selectedPayment.group === "bank"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200"
                    }`}
                    style={
                      selectedPayment.group === "bank"
                        ? {
                            borderColor: PRIMARY_RED,
                            backgroundColor: `${PRIMARY_RED}10`,
                          }
                        : {}
                    }
                    onClick={() =>
                      setSelectedPayment({ group: "bank", option: "bca" })
                    }
                  >
                    <p className="font-bold text-gray-800 flex items-center">
                      <Landmark className="mr-3 text-purple-500" size={20} />{" "}
                      Transfer Bank (Virtual Account)
                    </p>
                    {selectedPayment.group === "bank" && (
                      <div className="mt-4 pl-8">
                        <select
                          value={selectedPayment.option}
                          onChange={(e) =>
                            setSelectedPayment({
                              ...selectedPayment,
                              option: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded-lg focus:ring-orange-500"
                        >
                          {paymentOptions.bank.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.icon} {opt.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <div
                    className={`p-4 border rounded-xl cursor-pointer transition ${
                      selectedPayment.group === "cod"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200"
                    }`}
                    style={
                      selectedPayment.group === "cod"
                        ? {
                            borderColor: PRIMARY_RED,
                            backgroundColor: `${PRIMARY_RED}10`,
                          }
                        : {}
                    }
                    onClick={() =>
                      setSelectedPayment({ group: "cod", option: "cod" })
                    }
                  >
                    <p className="font-bold text-gray-800 flex items-center">
                      <Building className="mr-3 text-green-500" size={20} /> COD
                      (Bayar di Tempat)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-28">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <ShoppingCart
                    className="mr-3"
                    size={24}
                    style={{ color: PRIMARY_RED }}
                  />
                  Ringkasan Pesanan
                </h2>

                <div className="space-y-4 border-b pb-4 mb-4 max-h-60 overflow-y-auto">
                  {selectedProducts.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">
                      Tidak ada produk dipilih
                    </p>
                  ) : (
                    selectedProducts.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 pb-3 border-b last:border-b-0"
                      >
                        <img
                          src={
                            item.products?.image_url ||
                            "/images/default-product.png"
                          }
                          alt={item.products?.name}
                          className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                          onError={(e) => {
                            e.target.src = "/images/default-product.png";
                          }}
                        />
                        <div className="flex-grow">
                          <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                            {item.products?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: PRIMARY_RED }}
                        >
                          {formatCurrency(
                            (item.products?.price || 0) * item.quantity,
                          )}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal Produk</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Biaya Layanan</span>
                    <span>{formatCurrency(serviceFee)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span
                    className="text-2xl font-extrabold"
                    style={{ color: PRIMARY_RED }}
                  >
                    {formatCurrency(totalPayment)}
                  </span>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={selectedProducts.length === 0}
                  className="w-full text-white font-bold text-lg py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: PRIMARY_RED }}
                >
                  <CheckCircle size={20} /> Bayar Sekarang
                </button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-400">
                    Dengan melanjutkan, Anda menyetujui{" "}
                    <Link
                      to="/terms"
                      className="hover:underline"
                      style={{ color: PRIMARY_RED }}
                    >
                      Syarat & Ketentuan
                    </Link>{" "}
                    yang berlaku
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="w-full bg-gray-900 text-white py-6 mt-8">
          <div className="text-center text-sm">
            <p>© 2024 TENDERS PKU - First Street Nashville Hot Chicken</p>
            <p className="mt-1 text-gray-400">
              Jl. Hangtuah (Depan Plaza Kado), Pekanbaru
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Tersedia di GoFood & ShopeeFood
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default CheckoutPage;
