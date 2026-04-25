// src/Pages/FAQPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  User,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const FAQPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [openFAQId, setOpenFAQId] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // FAQ Data
  const faqItems = [
    {
      id: 1,
      question: "Apakah di Tenders PKU bisa memesan secara online?",
      answer:
        "Ya, Anda bisa memesan secara online melalui website resmi Tenders PKU, GoFood, atau ShopeeFood. Nikmati kemudahan memesan chicken tender favorit Anda dari mana saja.",
    },
    {
      id: 2,
      question: "Apakah Tenders PKU menyediakan layanan antar?",
      answer:
        "Tentu! Tenders PKU bekerja sama dengan GoFood dan ShopeeFood untuk layanan antar. Pesan melalui aplikasi partner kami dan makanan akan diantar ke lokasi Anda.",
    },
    {
      id: 3,
      question: "Metode pembayaran apa saja yang diterima?",
      answer:
        "Kami menerima berbagai metode pembayaran: Cash (di tempat), GoPay, ShopeePay, QRIS, Transfer Bank, dan Kartu Debit/Kredit.",
    },
    {
      id: 4,
      question: "Apakah ada program membership atau poin reward?",
      answer:
        "Saat ini Tenders PKU sedang mengembangkan program loyalty reward. Nantikan informasi selanjutnya untuk mendapatkan berbagai keuntungan eksklusif!",
    },
    {
      id: 5,
      question: "Jam operasional Tenders PKU?",
      answer:
        "Tenders PKU beroperasi setiap hari mulai pukul 15.00 WIB hingga sold out. Segera pesan sebelum kehabisan!",
    },
    {
      id: 6,
      question: "Apakah bisa request level kepedasan khusus?",
      answer:
        "Tentu! Tenders PKU menyediakan 4 level kepedasan: No Spicy, Mild, Hot, dan Extreme Hot. Anda bisa memilih sesuai selera saat memesan.",
    },
    {
      id: 7,
      question: "Apakah Tenders PKU menerima pesanan catering?",
      answer:
        "Ya, Tenders PKU menerima pesanan untuk acara atau catering. Silakan hubungi tim kami di nomor yang tersedia untuk informasi lebih lanjut.",
    },
    {
      id: 8,
      question: "Bagaimana cara komplain jika pesanan bermasalah?",
      answer:
        "Jika ada kendala dengan pesanan, silakan hubungi customer service kami melalui WhatsApp di 0813-7823-7282 atau email ke tenderspku@gmail.com.",
    },
  ];

  const handleToggleFAQ = (id) => {
    setOpenFAQId(openFAQId === id ? null : id);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ========== HEADER ========== */}
      <header className="bg-white shadow-md sticky top-0 z-30">
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
                <p className="text-xs text-gray-500 -mt-1">
                  First Street Nashville Hot Chicken
                </p>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-md mx-4 relative">
              <input
                type="text"
                placeholder="Cari pertanyaan..."
                className="w-full pl-4 pr-10 py-2 rounded-full bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <Search
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Link
                to="/cart"
                className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-orange-600 hover:bg-orange-100 transition"
              >
                <ShoppingCart size={20} />
              </Link>

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
            </div>
          </div>
        </div>
      </header>

      {/* ========== HERO SECTION ========== */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <HelpCircle size={48} className="mx-auto mb-4 opacity-80" />
          <h1 className="text-4xl font-bold mb-2">Frequently Asked Questions</h1>
          <p className="text-orange-100 text-lg">
            Temukan jawaban atas pertanyaan yang sering diajukan tentang Tenders PKU
          </p>
        </div>
      </div>

      {/* ========== FAQ CONTENT ========== */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {faqItems.map((item, index) => (
            <div
              key={item.id}
              className={`border-b border-gray-100 last:border-b-0 ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
              }`}
            >
              <button
                className="flex justify-between items-center w-full px-6 py-4 text-left hover:bg-orange-50 transition-colors group"
                onClick={() => handleToggleFAQ(item.id)}
              >
                <span className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                  {item.question}
                </span>
                {openFAQId === item.id ? (
                  <ChevronUp
                    size={20}
                    className="text-orange-500 transition-transform duration-300"
                  />
                ) : (
                  <ChevronDown
                    size={20}
                    className="text-gray-400 group-hover:text-orange-500 transition-transform duration-300"
                  />
                )}
              </button>
              {openFAQId === item.id && (
                <div className="px-6 pb-4 text-gray-600 leading-relaxed border-t border-orange-100 bg-orange-50/30">
                  <p className="pt-3">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ========== CONTACT SECTION ========== */}
      <div className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Masih Punya Pertanyaan?</h2>
            <p className="text-gray-600 mt-2">Hubungi kami langsung melalui kontak di bawah ini</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* WhatsApp */}
            <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle size={28} className="text-green-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">WhatsApp</h3>
              <p className="text-gray-600 mb-3">Chat dengan CS kami</p>
              <a
                href="https://wa.me/6281378237282"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                +62 813 7823 7282
              </a>
            </div>

            {/* Email */}
            <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-red-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Email</h3>
              <p className="text-gray-600 mb-3">Kirim email ke kami</p>
              <a
                href="mailto:tenderspku@gmail.com"
                className="inline-block px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                tenderspku@gmail.com
              </a>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin size={28} className="text-orange-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Lokasi</h3>
              <p className="text-gray-600 mb-3">Datang langsung ke gerai kami</p>
              <div className="text-sm text-gray-500">
                <p>Jl. Hangtuah</p>
                <p>(Depan Plaza Kado)</p>
                <p>Pekanbaru, Riau</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== OPERATIONAL HOURS ========== */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-white text-center">
          <Clock size={32} className="mx-auto mb-3" />
          <h3 className="text-xl font-bold mb-1">Jam Operasional</h3>
          <p className="text-orange-100">Setiap Hari • 15.00 - Sold Out</p>
        </div>
      </div>

      {/* ========== FOOTER ========== */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/images/Logo.png"
                  alt="Tenders PKU"
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/40x40/orange/white?text=T";
                  }}
                />
                <div>
                  <span className="font-bold text-lg text-orange-400">TENDERS</span>
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
                  <Link to="/" className="hover:text-orange-400">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/menu" className="hover:text-orange-400">
                    Menu
                  </Link>
                </li>
                <li>
                  <Link to="/promo" className="hover:text-orange-400">
                    Promo
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-orange-400">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-orange-400">Follow Us</h3>
              <div className="flex space-x-4">
                <a
                  href="https://instagram.com/tenders.pku"
                  target="_blank"
                  rel="noopener noreferrer"
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
            </div>
          </div>
          <div className="text-center text-gray-500 text-xs border-t border-gray-800 mt-8 pt-6">
            © 2024 TENDERS PKU - First Street Nashville Hot Chicken. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

// Import untuk icon yang kurang
import { Instagram, Facebook, Twitter } from "lucide-react";

export default FAQPage;