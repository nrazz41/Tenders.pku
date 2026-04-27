import React, { useState, useEffect } from "react";
import { 
  Search, Trash2, Edit3, UserPlus, Mail, Phone, 
  TrendingUp, Filter, Users, Plus, X, Save, 
  ChevronLeft, ChevronRight, Calendar
} from "lucide-react";
import axios from "axios";

// PENTING: Gunakan URL Laravel tanpa .php
const API_URL = "http://127.0.0.1:8000/api";

const ManajemenPelangganPage = () => {
  const [pelanggan, setPelanggan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State untuk Fitur Filter & Sort
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedMonth, setSelectedMonth] = useState("Semua");
  const [selectedDate, setSelectedDate] = useState(""); 

  // State untuk Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const initialForm = {
    id: "", 
    full_name: "", 
    email: "", 
    phone: "", 
    membership: "Classic", 
    total_transaction: 0 
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchPelanggan();
  }, []);

  const fetchPelanggan = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/users`);
      if (res.data.success) setPelanggan(res.data.data);
      else setPelanggan([]);
    } catch (e) {
      console.error("Gagal koneksi ke API Backend");
      // Dummy data untuk testing jika API offline
      setPelanggan([
        { id: 1, full_name: "Havisya Angelina", email: "havisya@pcr.ac.id", phone: "081266778899", membership: "Platinum", total_transaction: 1250000, created_at: '2026-04-01' },
        { id: 2, full_name: "Fadlan Alhamdi", email: "fadlan@pcr.ac.id", phone: "081211223344", membership: "Gold", total_transaction: 850000, created_at: '2026-04-10' },
        { id: 3, full_name: "Admin Test", email: "admin@test.com", phone: "0812345678", membership: "Silver", total_transaction: 100000, created_at: '2026-04-26' },
      ]);
    } finally { setLoading(false); }
  };

  // --- LOGIKA FILTER & SORTING ---
  const filteredData = pelanggan
    .filter(p => {
      // 1. Filter Search (Cari Nama)
      const matchesSearch = p.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. Filter Waktu (Bulan & Tanggal)
      let matchesTime = true;
      
      if (selectedDate !== "") {
        // Normalisasi tanggal agar cocok dengan input type="date" (YYYY-MM-DD)
        const d = new Date(p.created_at);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const rowDate = `${year}-${month}-${day}`; 

        matchesTime = rowDate === selectedDate;
      } else if (selectedMonth !== "Semua") {
        const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", 
                           "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        const d = new Date(p.created_at);
        matchesTime = namaBulan[d.getMonth()] === selectedMonth;
      }
      
      return matchesSearch && matchesTime;
    })
    .sort((a, b) => {
      if (sortOrder === "highest") {
        return (Number(b.total_transaction) || 0) - (Number(a.total_transaction) || 0);
      }
      return b.id - a.id; 
    });

  // --- FUNGSI CRUD ---
  const handleOpenModal = (data = null) => {
    if (data) {
      setIsEditing(true);
      setFormData({ ...data });
    } else {
      setIsEditing(false);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`${API_URL}/users/${formData.id}`, formData);
      } else {
        await axios.post(`${API_URL}/users`, formData);
      }
      setIsModalOpen(false);
      fetchPelanggan();
      alert("Data berhasil diproses");
    } catch (e) { 
      alert("Gagal menyimpan data."); 
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus pelanggan ini?")) {
      try {
        await axios.delete(`${API_URL}/users/${id}`);
        fetchPelanggan();
      } catch (e) { alert("Gagal menghapus"); }
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] p-6 font-sans text-gray-800">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#B82329]">Daftar Pelanggan</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#B82329] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-black transition-all shadow-md"
        >
          <Plus size={18} /> Tambah Pelanggan Baru
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-4 mb-8 items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" placeholder="Cari pelanggan..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Pilih Bulan */}
        <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white shadow-sm text-sm">
          <Calendar size={18} className="text-gray-400" />
          <select 
            className="outline-none bg-transparent cursor-pointer font-bold" 
            value={selectedMonth} 
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setSelectedDate(""); 
            }}
          >
            <option value="Semua">Semua Bulan</option>
            {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map(m => (
                <option key={m} value={m}>{m} 2026</option>
            ))}
          </select>
        </div>

        {/* Pilih Tanggal Spesifik */}
        <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white shadow-sm text-sm">
          <input 
            type="date" 
            className="outline-none bg-transparent cursor-pointer font-bold"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              if(e.target.value) setSelectedMonth("Semua");
            }}
          />
        </div>

        {/* Reset Filter */}
        {(selectedDate || selectedMonth !== "Semua") && (
          <button 
            onClick={() => {setSelectedDate(""); setSelectedMonth("Semua");}}
            className="text-sm font-bold text-red-600 hover:bg-red-50 px-3 py-1 rounded-md transition-all"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase">Total Pelanggan</p>
          <h3 className="text-3xl font-bold text-[#B82329]">{filteredData.length} Member</h3>
        </div>
        <div className="bg-[#B82329] p-6 rounded-xl shadow-md text-white">
          <p className="text-red-100 text-xs font-bold uppercase">Member Aktif</p>
          <h3 className="text-3xl font-bold">100%</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase">Level Tertinggi</p>
          <h3 className="text-3xl font-bold text-[#B82329]">Platinum</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase">Total Revenue</p>
          <h3 className="text-xl font-bold text-[#B82329]">
            Rp {filteredData.reduce((sum, p) => sum + (Number(p.total_transaction) || 0), 0).toLocaleString('id-ID')}
          </h3>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#B82329] text-white text-sm font-bold uppercase">
                <th className="px-6 py-4 text-center">ID</th>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Membership</th>
                <th className="px-6 py-4 text-right">Total Transaksi</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-red-50 transition-colors">
                  <td className="px-6 py-5 text-center font-mono text-xs text-gray-400">TDR-{String(item.id).padStart(3, '0')}</td>
                  <td className="px-6 py-5 font-bold text-gray-800">{item.full_name}</td>
                  <td className="px-6 py-5 text-sm text-gray-500">{item.email}</td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase">{item.membership}</span>
                  </td>
                  <td className="px-6 py-5 text-right font-black text-gray-900">
                    Rp {Number(item.total_transaction || 0).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => handleOpenModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit3 size={16}/></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="p-20 text-center text-gray-400 font-bold">
               <p>Data tidak ditemukan untuk filter ini.</p>
               <button onClick={() => {setSelectedDate(""); setSelectedMonth("Semua");}} className="mt-2 text-red-500 underline text-sm">Lihat semua data</button>
            </div>
          )}
        </div>
      </div>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-6 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#B82329] p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold uppercase italic tracking-tighter">{isEditing ? "Edit" : "Tambah"} Member</h2>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-all"><X size={24}/></button>
            </div>
            <form className="p-8 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Nama Lengkap</label>
                <input required name="full_name" value={formData.full_name || ""} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Email</label>
                <input required type="email" name="email" value={formData.email || ""} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Phone</label>
                  <input required name="phone" value={formData.phone || ""} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Tier</label>
                  <select name="membership" value={formData.membership || "Classic"} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold">
                    <option value="Classic">Classic</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Total Transaksi (Rp)</label>
                <input 
                  required 
                  type="number" 
                  name="total_transaction" 
                  value={formData.total_transaction ?? 0} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold" 
                />
              </div>
              <button type="submit" className="w-full py-4 bg-[#B82329] text-white rounded-xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2">
                <Save size={18} /> Simpan Data
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManajemenPelangganPage;