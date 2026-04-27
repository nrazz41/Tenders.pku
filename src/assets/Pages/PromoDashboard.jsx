// src/assets/Pages/PromoDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { PlusCircle, Search, Edit, Trash2, Tag, TrendingUp, Clock, Flame } from "lucide-react";
import axios from "axios";
import PromoForm from "./PromoForm";

const API_URL = "http://127.0.0.1:8000/api";

const formatCurrency = (value) => {
  const num = Number(value ?? 0);
  if (isNaN(num)) return "Rp 0";
  return `Rp ${num.toLocaleString("id-ID")}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function PromoDashboard() {
  const [promos, setPromos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPromos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/promos`);
      console.log("Fetched promos:", response.data);
      
      if (response.data.success) {
        setPromos(response.data.data || []);
      } else {
        setError(response.data.error);
      }
    } catch (error) {
      console.error("Error fetching promos:", error);
      setError("Tidak dapat terhubung ke server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  // Statistik
  const totalPromos = promos.length;
  const activePromos = promos.filter(p => p.status === "active").length;
  const avgDiscount = promos.length > 0 
    ? Math.round(promos.reduce((sum, p) => sum + p.discount, 0) / promos.length) 
    : 0;
  const highestDiscount = promos.length > 0 ? Math.max(...promos.map(p => p.discount)) : 0;

  // Filter berdasarkan search
  const filteredPromos = promos.filter(promo => {
    return promo.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleAddPromo = () => {
    setEditingPromo(null);
    setIsFormOpen(true);
  };

  const handleEditPromo = (promo) => {
    setEditingPromo(promo);
    setIsFormOpen(true);
  };

  const handleDeletePromo = async (id, name) => {
    if (!window.confirm(`Hapus promo "${name}"?`)) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${API_URL}/promos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        alert("✅ Promo berhasil dihapus!");
        fetchPromos();
      } else {
        alert(response.data.error || "Gagal menghapus promo");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("❌ Gagal menghapus promo");
    }
  };

  const handleSubmitPromo = async (promoData) => {
    try {
      const token = localStorage.getItem("token");
      let response;

      if (promoData.id) {
        // Update existing promo
        response = await axios.put(`${API_URL}/promos/${promoData.id}`, promoData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          alert(`✅ Promo "${promoData.name}" berhasil diperbarui!`);
        }
      } else {
        // Create new promo
        response = await axios.post(`${API_URL}/promos`, promoData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          alert(`✅ Promo "${promoData.name}" berhasil ditambahkan!`);
        }
      }

      if (response.data.success) {
        fetchPromos(); // Refresh data
        setIsFormOpen(false);
        setEditingPromo(null);
      } else {
        alert(response.data.error || "Gagal menyimpan promo");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("❌ Gagal menyimpan promo");
    }
  };

  const getStatusBadge = (status, endDate) => {
    // Cek apakah promo sudah berakhir berdasarkan tanggal
    const isExpired = endDate && new Date(endDate) < new Date();
    if (status === "inactive" || isExpired) {
      return "bg-gray-100 text-gray-600";
    }
    return "bg-green-100 text-green-700";
  };

  const getStatusText = (status, endDate) => {
    const isExpired = endDate && new Date(endDate) < new Date();
    if (status === "inactive" || isExpired) return "Berakhir";
    return "Aktif";
  };

  const calculatePromoPrice = (price, discount) => {
    return price * (100 - discount) / 100;
  };

  const primaryOrange = "#F97316";

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
          <p className="text-sm mt-2">Pastikan backend Laravel berjalan di http://127.0.0.1:8000</p>
          <button onClick={fetchPromos} className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 mb-8 bg-white rounded-xl shadow-lg border-b-4 border-orange-500">
        <h2 className="text-3xl font-extrabold text-orange-600">Manajemen Promo</h2>
        <button
          onClick={handleAddPromo}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 shadow-md"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Tambah Promo</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Total Promo</p>
              <p className="text-3xl font-bold text-gray-800">{totalPromos}</p>
            </div>
            <Tag className="w-10 h-10 text-orange-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Promo Aktif</p>
              <p className="text-3xl font-bold text-gray-800">{activePromos}</p>
            </div>
            <Flame className="w-10 h-10 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Rata-rata Diskon</p>
              <p className="text-3xl font-bold text-gray-800">{avgDiscount}%</p>
            </div>
            <TrendingUp className="w-10 h-10 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Diskon Tertinggi</p>
              <p className="text-3xl font-bold text-gray-800">{highestDiscount}%</p>
            </div>
            <Clock className="w-10 h-10 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Cari promo berdasarkan nama..."
            className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-orange-500 text-white">
              <tr>
              <th className="px-5 py-3 text-left text-sm font-semibold">No</th>
              <th className="px-5 py-3 text-left text-sm font-semibold">Gambar</th>
              <th className="px-5 py-3 text-left text-sm font-semibold">Nama Produk</th>
              <th className="px-5 py-3 text-left text-sm font-semibold">Harga</th>
              <th className="px-5 py-3 text-left text-sm font-semibold">Diskon</th>
              <th className="px-5 py-3 text-left text-sm font-semibold">Harga Promo</th>
              <th className="px-5 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-5 py-3 text-left text-sm font-semibold">Masa Berlaku</th>
              <th className="px-5 py-3 text-center text-sm font-semibold">Aksi</th>
            </tr>
            </thead>
            <tbody>
              {filteredPromos.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-gray-500">
                    {searchTerm ? "Tidak ada promo yang sesuai" : "Belum ada data promo"}
                  </td>
                </tr>
              ) : (
                filteredPromos.map((item, index) => {
                  const promoPrice = calculatePromoPrice(item.price, item.discount);
                  return (
                    <tr key={item.id} className="border-b hover:bg-orange-50">
                      <td className="px-5 py-3 text-gray-600">{index + 1}</td>
                      <td className="px-5 py-3">
                        <img 
                          src={item.image_url || "/images/default-product.png"} 
                          alt={item.name} 
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => { e.target.src = "/images/default-product.png"; }}
                        />
                      </td>
                      <td className="px-5 py-3 font-medium">{item.name}</td>
                      <td className="px-5 py-3">{formatCurrency(item.price)}</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold">
                          {item.discount}%
                        </span>
                      </td>
                      <td className="px-5 py-3 font-semibold text-green-600">{formatCurrency(promoPrice)}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(item.status, item.end_date)}`}>
                          {getStatusText(item.status, item.end_date)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-sm">
                        {formatDate(item.start_date)} - {formatDate(item.end_date)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button onClick={() => handleEditPromo(item)} className="p-1 text-blue-500 hover:bg-blue-50 rounded mx-1" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeletePromo(item.id, item.name)} className="p-1 text-red-500 hover:bg-red-50 rounded mx-1" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total Data */}
      <div className="mt-4 text-right text-sm text-gray-500">
        Total {filteredPromos.length} data promo
      </div>

      {/* Promo Form Modal */}
      <PromoForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitPromo}
        initialData={editingPromo}
      />
    </div>
  );
}