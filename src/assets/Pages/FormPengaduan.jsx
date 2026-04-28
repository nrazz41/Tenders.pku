// src/assets/Pages/FormPengaduan.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Send, User, Mail, MessageSquare, Star, Phone, MapPin } from "lucide-react";
import { supabase } from "../../services/supabaseClient";

const PRIMARY_RED = "#B82329";

const FormPengaduan = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    complaint_type: "keluhan",
    message: "",
    rating: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const complaintTypes = [
    { value: "keluhan", label: "📢 Keluhan" },
    { value: "saran", label: "💡 Saran" },
    { value: "kritik", label: "👎 Kritik" },
    { value: "pujian", label: "👍 Pujian" },
    { value: "laporkan_gagal_pesan", label: "⚠️ Gagal Pesan" },
    { value: "laporkan_pelayanan", label: "🛎️ Pelayanan" },
    { value: "laporkan_kualitas_makanan", label: "🍗 Kualitas Makanan" },
  ];

  // Load user dari localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setFormData(prev => ({
          ...prev,
          name: parsedUser.full_name || parsedUser.email?.split('@')[0] || "",
          email: parsedUser.email || "",
          phone: parsedUser.phone || "",
        }));
      } catch(e) {}
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRating = (rating) => {
    setFormData({ ...formData, rating });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error: insertError } = await supabase
        .from('complaints')
        .insert([{
          user_id: user?.id || null,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          complaint_type: formData.complaint_type,
          rating: formData.rating,
          message: formData.message,
          status: 'pending',
          created_at: new Date()
        }])
        .select();

      if (insertError) throw insertError;

      setSuccess("✅ Terima kasih! Pengaduan/saran Anda telah kami terima.");
      setFormData({
        name: user?.full_name || user?.email?.split('@')[0] || "",
        email: user?.email || "",
        phone: user?.phone || "",
        complaint_type: "keluhan",
        message: "",
        rating: 0,
      });
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan. Silakan coba lagi nanti.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            📝 Form <span style={{ color: PRIMARY_RED }}>Pengaduan & Saran</span>
          </h1>
          <p className="text-gray-500 mt-2">
            Kami menghargai setiap masukan dari pelanggan Tenders PKU
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-4">
            <h2 className="text-white font-bold text-xl flex items-center gap-2">
              <AlertCircle size={24} /> Isi Form Dibawah Ini
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Nama */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <User size={18} /> Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Masukkan nama Anda"
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <Mail size={18} /> Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <Phone size={18} /> No. Telepon
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="0812-3456-7890"
                />
              </div>
            </div>

            {/* Tipe Pengaduan */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Jenis Pengaduan / Saran</label>
              <select
                name="complaint_type"
                value={formData.complaint_type}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {complaintTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Rating Pengalaman Anda</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRating(star)}
                    className={`text-3xl transition-transform hover:scale-110 focus:outline-none ${
                      formData.rating >= star ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Pesan */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <MessageSquare size={18} /> Pesan <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                placeholder="Ceritakan pengalaman, keluhan, atau saran Anda..."
              />
            </div>

            {/* Info */}
            <div className="p-4 rounded-xl text-sm text-gray-600" style={{ backgroundColor: `${PRIMARY_RED}10` }}>
              <p className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5" style={{ color: PRIMARY_RED }} />
                <span>Pengaduan Anda akan langsung kami respon dalam 1x24 jam. Terima kasih atas kepercayaan Anda kepada Tenders PKU!</span>
              </p>
            </div>

            {/* Error & Success */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 text-white font-bold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(to right, ${PRIMARY_RED}, #8B1A1F)` }}
            >
              {isSubmitting ? (
                "Mengirim..."
              ) : (
                <>
                  <Send size={18} /> Kirim Pengaduan
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="hover:underline" style={{ color: PRIMARY_RED }}>
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FormPengaduan;