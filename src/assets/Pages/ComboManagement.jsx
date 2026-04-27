// src/assets/Pages/ComboManagement.jsx
import React, { useState, useEffect, useCallback } from "react";
import { PlusCircle, Search, Edit, Trash2, Eye, EyeOff, Package, TrendingUp, Clock } from "lucide-react";
import axios from "axios";
import ComboForm from "./ComboForm";

const API_URL = "http://127.0.0.1:8000/api";

const formatCurrency = (value) => {
  const num = Number(value ?? 0);
  if (isNaN(num)) return "Rp 0";
  return `Rp ${num.toLocaleString("id-ID")}`;
};

export default function ComboManagement() {
  const [combos, setCombos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchCombos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/combos/admin`);
      if (response.data.success) {
        setCombos(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching combos:", error);
      setError("Tidak dapat terhubung ke server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCombos();
  }, [fetchCombos]);

  // Statistik
  const totalCombos = combos.length;
  const activeCombos = combos.filter(c => c.is_active).length;
  const totalDiscountValue = combos.reduce((sum, c) => sum + (c.discount || 0), 0);
  const avgDiscount = combos.length > 0 ? Math.round(totalDiscountValue / combos.length) : 0;

  // Filter
  const filteredCombos = combos.filter(combo =>
    combo.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCombos.length / itemsPerPage);
  const paginatedCombos = filteredCombos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAdd = () => {
    setEditingCombo(null);
    setIsFormOpen(true);
  };

  const handleEdit = (combo) => {
    setEditingCombo(combo);
    setIsFormOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Hapus paket hemat "${name}"?`)) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${API_URL}/combos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        alert("✅ Paket hemat berhasil dihapus!");
        fetchCombos();
      }
    } catch (error) {
      alert("❌ Gagal menghapus paket hemat");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`${API_URL}/combos/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        alert(currentStatus ? "Paket hemat dinonaktifkan" : "Paket hemat diaktifkan");
        fetchCombos();
      }
    } catch (error) {
      alert("❌ Gagal mengubah status");
    }
  };

  const handleSubmit = async (comboData) => {
    try {
      const token = localStorage.getItem("token");
      let response;

      if (comboData.id) {
        response = await axios.put(`${API_URL}/combos/${comboData.id}`, comboData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) alert("✅ Paket hemat berhasil diperbarui!");
      } else {
        response = await axios.post(`${API_URL}/combos`, comboData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) alert("✅ Paket hemat berhasil ditambahkan!");
      }

      if (response.data.success) {
        fetchCombos();
        setIsFormOpen(false);
        setEditingCombo(null);
      }
    } catch (error) {
      alert("❌ Gagal menyimpan paket hemat");
    }
  };

  const primaryOrange = "#F97316";

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 mb-8 bg-white rounded-xl shadow-lg border-b-4 border-orange-500">
        <h2 className="text-3xl font-extrabold text-orange-600">Paket Hemat</h2>
        <button onClick={handleAdd} className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 shadow-md">
          <PlusCircle className="w-5 h-5" /> Tambah Paket
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500">
          <div><p className="text-gray-500 text-sm">Total Paket</p><p className="text-3xl font-bold text-gray-800">{totalCombos}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
          <div><p className="text-gray-500 text-sm">Paket Aktif</p><p className="text-3xl font-bold text-gray-800">{activeCombos}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
          <div><p className="text-gray-500 text-sm">Rata-rata Diskon</p><p className="text-3xl font-bold text-gray-800">{avgDiscount}%</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <div><p className="text-gray-500 text-sm">Total Diskon</p><p className="text-2xl font-bold text-blue-600">{formatCurrency(totalDiscountValue)}</p></div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <div className="relative w-full md:w-96">
          <input type="text" placeholder="Cari paket hemat..." className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-orange-500 text-white">
              <tr><th className="px-5 py-3 text-left">No</th><th className="px-5 py-3 text-left">Gambar</th><th className="px-5 py-3 text-left">Nama Paket</th><th className="px-5 py-3 text-left">Items</th><th className="px-5 py-3 text-left">Harga</th><th className="px-5 py-3 text-left">Diskon</th><th className="px-5 py-3 text-left">Status</th><th className="px-5 py-3 text-center">Aksi</th></tr>
            </thead>
            <tbody>
              {paginatedCombos.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-12 text-gray-500">Belum ada paket hemat</td></tr>
              ) : (
                paginatedCombos.map((item, idx) => (
                  <tr key={item.id} className="border-b hover:bg-orange-50">
                    <td className="px-5 py-3">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="px-5 py-3"><img src={item.image_url || "/images/combo-default.png"} alt={item.name} className="w-12 h-12 rounded-lg object-cover" onError={(e) => e.target.src = "/images/combo-default.png"} /></td>
                    <td className="px-5 py-3 font-medium">{item.name}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 max-w-xs truncate">{item.items}</td>
                    <td className="px-5 py-3">{formatCurrency(item.price)}</td>
                    <td className="px-5 py-3"><span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold">{item.discount}% OFF</span></td>
                    <td className="px-5 py-3"><span className={`px-2 py-1 rounded-full text-xs ${item.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{item.is_active ? "Aktif" : "Nonaktif"}</span></td>
                    <td className="px-5 py-3 text-center">
                      <button onClick={() => handleEdit(item)} className="p-1 text-blue-500 hover:bg-blue-50 rounded mx-1" title="Edit"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleToggleStatus(item.id, item.is_active)} className="p-1 text-yellow-500 hover:bg-yellow-50 rounded mx-1" title={item.is_active ? "Nonaktifkan" : "Aktifkan"}>{item.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                      <button onClick={() => handleDelete(item.id, item.name)} className="p-1 text-red-500 hover:bg-red-50 rounded mx-1" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t"><span>Halaman {currentPage} dari {totalPages}</span><div className="flex gap-2"><button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1} className="px-3 py-1 border rounded">Prev</button><button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage===totalPages} className="px-3 py-1 border rounded">Next</button></div></div>
        )}
      </div>

      {/* Form Modal */}
      <ComboForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={handleSubmit} initialData={editingCombo} />
    </div>
  );
}