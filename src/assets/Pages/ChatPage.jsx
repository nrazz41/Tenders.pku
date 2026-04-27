// src/assets/pages/ChatPage.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Send,
  Paperclip,
  Smile,
  Bell,
  Percent,
  ShoppingCart,
  User,
  ArrowLeft,
  Package,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const API_URL = "http://127.0.0.1:8000/api";

const ChatPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State untuk menyimpan pesan
  const [messages, setMessages] = useState([]);
  const [chatStarted, setChatStarted] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [currentSuggestedQuestions, setCurrentSuggestedQuestions] = useState([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [products, setProducts] = useState([]);
  const messagesEndRef = useRef(null);
  const suggestionTimerRef = useRef(null);
  const INACTIVITY_DELAY = 5000;

  // Fetch products dari database
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      // Dummy data for testing
      setProducts([
        { id: 1, name: "Original Chicken Tender", price: 25000, description: "Chicken tender crispy", stock: 99 },
        { id: 2, name: "Nashville Hot Tender", price: 28000, description: "Pedas khas Nashville", stock: 85 },
        { id: 3, name: "Hot Mozzville Original", price: 32000, description: "Mozzarella melt", stock: 45 },
      ]);
    }
  };

  // Pertanyaan yang sudah ditentukan
  const predefinedQuestions = [
    {
      id: "status",
      text: "Status Pesanan",
      answer: "Untuk melacak pesanan Anda, silakan kunjungi halaman Riwayat Pesanan dan masukkan nomor pesanan Anda.",
    },
    {
      id: "promo",
      text: "Promo Terbaru",
      answer: "Cek halaman Promo untuk melihat diskon dan penawaran terbaru kami! Follow Instagram @tenders.pku untuk info update.",
    },
    {
      id: "location",
      text: "Lokasi Toko",
      answer: "Tenders PKU berlokasi di Jl. Hangtuah (Depan Plaza Kado), Pekanbaru, Riau.",
    },
    {
      id: "hours",
      text: "Jam Operasional",
      answer: "Tenders PKU buka setiap hari mulai pukul 15.00 WIB hingga sold out.",
    },
    {
      id: "delivery",
      text: "Delivery Partner",
      answer: "Kami bekerja sama dengan GoFood dan ShopeeFood untuk layanan antar.",
    },
  ];

  // Saran pertanyaan cepat
  const quickQuestions = [
    { id: "menu", text: "Lihat Menu", type: "menu" },
    { id: "promo", text: "Info Promo", type: "promo" },
    { id: "location", text: "Lokasi Toko", type: "location" },
    { id: "hours", text: "Jam Buka", type: "hours" },
    { id: "order", text: "Status Pesanan", type: "order" },
  ];

  const clearTimeoutIfExists = () => {
    if (suggestionTimerRef.current) {
      clearTimeout(suggestionTimerRef.current);
      suggestionTimerRef.current = null;
    }
  };

  const startChat = useCallback(() => {
    setChatStarted(true);
    setMessages([]);
    setCurrentSuggestedQuestions(quickQuestions);
    
    // Welcome message
    setTimeout(() => {
      const welcomeMsg = {
        id: Date.now(),
        text: "Halo! Selamat datang di Pusat Bantuan Tenders PKU. Ada yang bisa kami bantu? Silakan pilih pertanyaan di bawah atau ketik langsung pertanyaan Anda.",
        sender: "other",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages([welcomeMsg]);
    }, 500);
  }, []);

  const sendAiMessage = useCallback((responseText, delay = 1000) => {
    return new Promise((resolve) => {
      setIsAiTyping(true);
      setTimeout(() => {
        const aiMsg = {
          id: Date.now(),
          text: responseText,
          sender: "other",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsAiTyping(false);
        resolve();
      }, delay);
    });
  }, []);

  // Cari produk berdasarkan keyword
  const findProduct = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Keyword untuk setiap kategori
    const keywords = {
      tender: ["chicken tender", "tender", "ayam crispy", "original tender", "nashville"],
      mozzville: ["mozzville", "mozzarella", "cheese", "keju lumer"],
      sides: ["fries", "kentang", "crispy fries", "cheese fries"],
      beverages: ["drink", "minuman", "lemon tea", "soft drink", "cola"],
    };
    
    // Cari berdasarkan keyword
    for (const [category, words] of Object.entries(keywords)) {
      for (const word of words) {
        if (lowerMessage.includes(word)) {
          const product = products.find(p => p.category === category);
          if (product) return product;
        }
      }
    }
    
    // Cari berdasarkan nama produk
    return products.find(p => lowerMessage.includes(p.name.toLowerCase()));
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    clearTimeoutIfExists();

    const userMsg = {
      id: Date.now(),
      text: newMessage.trim(),
      sender: "me",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const userQuestion = newMessage.trim().toLowerCase();
    setNewMessage("");
    setCurrentSuggestedQuestions([]);

    await sendAiMessage("Sedang mencari informasi...", 800);

    // Logika respons berdasarkan pertanyaan
    let response = "";
    
    if (userQuestion.includes("menu") || userQuestion.includes("produk") || userQuestion.includes("makanan")) {
      response = "Menu utama Tenders PKU:\n🍗 Chicken Tender (Original, Nashville, Level 2, Level 3)\n🧀 Hot Mozzville (Original & Nashville)\n🍟 Sides (Crispy Fries, Cheese Fries)\n🥤 Beverages (Lemon Tea, Soft Drink)\n\nKunjungi halaman Menu untuk detail lengkap!";
    }
    else if (userQuestion.includes("harga")) {
      const product = findProduct(userQuestion);
      if (product) {
        response = `${product.name}: Rp ${product.price.toLocaleString('id-ID')}\n${product.description || ''}\nStok: ${product.stock} tersedia.`;
      } else {
        response = "Harga menu bervariasi mulai dari Rp 5.000 - Rp 35.000. Cek halaman Menu untuk detail lengkap!";
      }
    }
    else if (userQuestion.includes("lokasi") || userQuestion.includes("alamat")) {
      response = "📍 Tenders PKU berlokasi di:\nJl. Hangtuah (Depan Plaza Kado)\nPekanbaru, Riau\n\nBuka setiap hari pukul 15.00 - Sold Out";
    }
    else if (userQuestion.includes("jam") || userQuestion.includes("buka") || userQuestion.includes("operasional")) {
      response = "⏰ Jam operasional Tenders PKU:\nSetiap Hari • 15.00 WIB - Sold Out\n\nJangan sampai kehabisan, pesan segera!";
    }
    else if (userQuestion.includes("delivery") || userQuestion.includes("antar") || userQuestion.includes("gofood")) {
      response = "🛵 Tenders PKU tersedia di:\n• GoFood\n• ShopeeFood\n\nPesan sekarang dari rumah!";
    }
    else if (userQuestion.includes("promo") || userQuestion.includes("diskon")) {
      response = "🎉 Promo spesial! Cek halaman Promo di website kami atau follow Instagram @tenders.pku untuk info terbaru!";
    }
    else if (userQuestion.includes("pesanan") || userQuestion.includes("status")) {
      if (user) {
        response = "Untuk cek status pesanan, silakan buka halaman Riwayat Pesanan di akun Anda.";
      } else {
        response = "Silakan login terlebih dahulu untuk melihat status pesanan Anda.";
      }
    }
    else {
      const product = findProduct(userQuestion);
      if (product) {
        response = `🍗 ${product.name}\n💰 Harga: Rp ${product.price.toLocaleString('id-ID')}\n📝 ${product.description || 'Menu favorit Tenders PKU'}\n📦 Stok: ${product.stock} tersedia\n\nTertarik? Klik produk untuk memesan!`;
      } else {
        response = "Maaf, saya kurang memahami pertanyaan Anda. Silakan pilih pertanyaan cepat di bawah atau hubungi customer service kami di WhatsApp 0813-7823-7282.";
      }
    }

    await sendAiMessage(response, 1000);
    
    // Tampilkan saran pertanyaan cepat setelah respons
    setTimeout(() => {
      setCurrentSuggestedQuestions(quickQuestions);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestion = async (question) => {
    clearTimeoutIfExists();
    
    const userMsg = {
      id: Date.now(),
      text: question.text,
      sender: "me",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setCurrentSuggestedQuestions([]);
    
    await sendAiMessage("Sedang mencari informasi...", 800);
    
    let response = "";
    switch(question.id) {
      case "menu":
        response = "🍽️ Menu Tenders PKU:\n\n🍗 CHICKEN TENDER\n• Original - Rp 25.000\n• Nashville Hot - Rp 28.000\n• Level 2 Hot - Rp 27.000\n• Level 3 Extreme - Rp 29.000\n\n🧀 HOT MOZZVILLE\n• Original - Rp 32.000\n• Nashville - Rp 35.000\n\n🍟 SIDES\n• Crispy Fries - Rp 15.000\n• Cheese Fries - Rp 22.000\n\n🥤 BEVERAGES\n• Lemon Tea - Rp 8.000\n• Soft Drink - Rp 7.000\n\nKunjungi halaman Menu untuk detail!";
        break;
      case "promo":
        response = "🎉 Promo spesial! Kunjungi halaman Promo untuk melihat paket hemat seperti:\n• Nashville Signature (2 Tender + Mozzville + Fries + Drink) - Rp 55.000\n• Hot Couple - Rp 105.000\n• Family Pack - Rp 199.000";
        break;
      case "location":
        response = "📍 Tenders PKU\nJl. Hangtuah (Depan Plaza Kado)\nPekanbaru, Riau\n\nIkutiInstagram @tenders.pku untuk update lokasi!";
        break;
      case "hours":
        response = "⏰ Jam Operasional Tenders PKU\nSetiap Hari\n15.00 WIB - Sold Out\n\nPesan sebelum kehabisan!";
        break;
      case "order":
        if (user) {
          response = "Untuk cek status pesanan:\n1. Login ke akun Anda\n2. Buka halaman Riwayat Pesanan\n3. Lihat status pesanan Anda\n\nButuh bantuan? Hubungi WhatsApp 0813-7823-7282";
        } else {
          response = "Silakan login terlebih dahulu ke akun Anda untuk melihat riwayat pesanan.";
        }
        break;
      default:
        response = "Ada yang bisa kami bantu? Silakan pilih pertanyaan lain atau ketik langsung.";
    }
    
    await sendAiMessage(response, 1000);
    
    setTimeout(() => {
      setCurrentSuggestedQuestions(quickQuestions);
    }, 1500);
  };

  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="w-full bg-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/images/Logo.png" alt="Tenders PKU" className="w-12 h-12 rounded-full border-2 border-orange-500 object-cover" />
              <div>
                <span className="font-bold text-xl text-orange-600">TENDERS</span>
                <span className="font-bold text-xl text-gray-800"> PKU</span>
                <p className="text-xs text-gray-500 -mt-1">First Street Nashville Hot Chicken</p>
              </div>
            </Link>

            <div className="flex items-center space-x-2">
              <Link to="/cart" className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-orange-600">
                <ShoppingCart size={20} />
              </Link>
              <Link to="/notifications" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-orange-600">
                <Bell size={20} />
              </Link>
              <Link to="/promo-page" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-orange-600">
                <Percent size={20} />
              </Link>
              {user ? (
                <Link to="/profile" className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-full">
                  <User size={16} />
                  <span>{user.full_name?.split(" ")[0] || user.username}</span>
                </Link>
              ) : (
                <Link to="/login" className="ml-2 px-4 py-2 bg-orange-500 text-white rounded-full flex items-center gap-2">
                  <User size={16} /> Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Container */}
      <div className="relative flex flex-col max-w-3xl w-full bg-white rounded-lg shadow-lg my-6 md:my-8 h-[70vh] md:h-[80vh] overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center p-4 border-b border-gray-200 bg-orange-50">
          <Link to="/" className="text-gray-600 hover:text-orange-600 mr-3">
            <ArrowLeft size={24} />
          </Link>
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
              T
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
          </div>
          <div className="ml-3">
            <h2 className="font-semibold text-gray-800 text-lg">Customer Service TENDERS PKU</h2>
            <p className="text-green-600 text-sm">Online • Respon cepat</p>
          </div>
        </div>

        {!chatStarted ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-gray-600">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle size={40} className="text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Selamat Datang di Pusat Bantuan Tenders PKU!</h2>
            <p className="mb-6 max-w-sm">Kami siap membantu Anda. Silakan mulai chat untuk terhubung dengan Customer Service kami.</p>
            <button onClick={startChat} className="px-6 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition shadow-md">
              Mulai Chat
            </button>
          </div>
        ) : (
          <>
            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex mb-4 ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] px-4 py-2 rounded-lg shadow-sm text-sm ${
                    msg.sender === "me"
                      ? "bg-orange-500 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}>
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <span className={`block text-xs mt-1 ${msg.sender === "me" ? "text-orange-100" : "text-gray-400"} text-right`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              
              {isAiTyping && (
                <div className="flex justify-start mb-4">
                  <div className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800">
                    <div className="flex space-x-1">
                      <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                      <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
              
              {/* Quick Questions */}
              {currentSuggestedQuestions.length > 0 && (
                <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                  <p className="text-orange-800 font-semibold mb-2">Pertanyaan Cepat:</p>
                  <div className="flex flex-wrap gap-2">
                    {currentSuggestedQuestions.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => handleQuickQuestion(q)}
                        className="px-4 py-2 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 transition shadow-sm"
                      >
                        {q.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="flex items-center p-4 border-t border-gray-200 bg-gray-50">
              <textarea
                className="flex-1 border border-gray-300 rounded-full py-2 px-4 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-700"
                rows="1"
                placeholder="Ketik pesan..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{ minHeight: "40px", maxHeight: "120px", lineHeight: "24px" }}
              />
              <button
                className="ml-3 p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition disabled:opacity-50"
                onClick={handleSendMessage}
                disabled={newMessage.trim() === "" || isAiTyping}
              >
                <Send size={20} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>© 2024 TENDERS PKU - First Street Nashville Hot Chicken</p>
          <p className="mt-2 text-gray-400">Jl. Hangtuah (Depan Plaza Kado), Pekanbaru</p>
          <p className="mt-1 text-gray-400">📞 +62 813 7823 7282</p>
        </div>
      </footer>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        .animate-bounce {
          animation: bounce 1.4s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ChatPage;