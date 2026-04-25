// src/Pages/ManajemenPelangganPage.jsx
import React, { useState, useEffect } from "react";
import { Search, Plus, Trash2, Edit3, Filter, Award, Users, UserCheck, UserX, Mail, Phone, MapPin, Calendar, DollarSign } from "lucide-react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const API_URL = "http://localhost/tenders_pku_api/api";

const ManajemenPelangganPage = () => {
  const { user, isAdmin } = useAuth();
  const primaryOrange = '#F97316';
  const goldColor = '#DAA520';
  const silverColor = '#C0C0C0';
  const classicColor = '#CD7F32';

  const membershipLevels = [
    { level: 'Classic', color: classicColor, badgeBg: '#CD7F32', badgeText: 'text-white', icon: '🥉' },
    { level: 'Silver', color: silverColor, badgeBg: '#C0C0C0', badgeText: 'text-gray-800', icon: '🥈' },
    { level: 'Gold', color: goldColor, badgeBg: '#DAA520', badgeText: 'text-white', icon: '🥇' },
    { level: 'Platinum', color: primaryOrange, badgeBg: '#F97316', badgeText: 'text-white', icon: '💎' },
  ];

  const [pelanggan, setPelanggan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMembership, setFilterMembership] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    username: "",
    email: "",
    full_name: "",
    phone: "",
    address: "",
    membership: "Classic",
    status: "active",
    notes: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch pelanggan from database
  useEffect(() => {
    if (!isAdmin) {
      // Redirect if not admin
      window.location.href = '/';
    } else {
      fetchPelanggan();
    }
  }, [isAdmin]);

  const fetchPelanggan = async () => {
    setLoading(true);
    try {
      // Get all users from database
      const response = await axios.get(`${API_URL}/users.php`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        // Filter only users (not admin) and map to customer format
        const customers = response.data.data
          .filter(u => u.role === 'user')
          .map(u => ({
            id: u.id,
            customer_id: `C${String(u.id).padStart(3, '0')}`,
            name: u.full_name || u.username,
            username: u.username,
            email: u.email,
            phone: u.phone || '-',
            address: u.address || '-',
            membership: u.membership || 'Classic',
            status: u.status || 'active',
            totalTransaction: u.total_transaction || 0,
            joinDate: u.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            notes: u.notes || '',
          }));
        setPelanggan(customers);
      } else {
        // Fallback to dummy data if API fails
        loadDummyData();
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      loadDummyData();
    } finally {
      setLoading(false);
    }
  };

  const loadDummyData = () => {
    const dummyCustomers = [
      { id: 1, customer_id: "C001", name: "Budi Santoso", username: "budisantoso", email: "budi@example.com", phone: "081234567890", address: "Jl. Sudirman No. 1", membership: "Platinum", status: "active", totalTransaction: 2500000, joinDate: "2024-01-15", notes: "Pelanggan setia" },
      { id: 2, customer_id: "C002", name: "Siti Aminah", username: "siti123", email: "siti@example.com", phone: "081234567891", address: "Jl. Thamrin No. 2", membership: "Gold", status: "active", totalTransaction: 1500000, joinDate: "2024-02-20", notes: "" },
      { id: 3, customer_id: "C003", name: "Joko Susanto", username: "jokosusanto", email: "joko@example.com", phone: "081234567892", address: "Jl. Diponegoro No. 3", membership: "Silver", status: "inactive", totalTransaction: 500000, joinDate: "2024-03-10", notes: "" },
    ];
    setPelanggan(dummyCustomers);
  };

  const getMembershipLevelClasses = (level) => {
    const membership = membershipLevels.find(m => m.level === level);
    if (membership) {
      return `bg-[${membership.badgeBg}] ${membership.badgeText} font-bold`;
    }
    return 'bg-gray-200 text-gray-700';
  };

  const getMembershipIcon = (level) => {
    const membership = membershipLevels.find(m => m.level === level);
    return membership?.icon || '👤';
  };

  const handleDelete = async (id, customerId) => {
    if (window.confirm(`Yakin ingin menghapus pelanggan ${customerId}?`)) {
      try {
        const response = await axios.delete(`${API_URL}/users.php?id=${id}`, {
          withCredentials: true
        });
        if (response.data.success) {
          alert('Pelanggan berhasil dihapus!');
          fetchPelanggan();
        } else {
          alert(response.data.error || 'Gagal menghapus pelanggan');
        }
      } catch (error) {
        console.error("Error deleting customer:", error);
        alert('Gagal menghapus pelanggan');
      }
    }
  };

  const handleEdit = (cust) => {
    setFormData({
      id: cust.id,
      username: cust.username,
      email: cust.email,
      full_name: cust.name,
      phone: cust.phone,
      address: cust.address,
      membership: cust.membership,
      status: cust.status,
      notes: cust.notes || '',
    });
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleAdd = () => {
    setFormData({
      id: null,
      username: "",
      email: "",
      full_name: "",
      phone: "",
      address: "",
      membership: "Classic",
      status: "active",
      notes: "",
    });
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleFormSubmit = async () => {
    try {
      if (isEditing) {
        // Update customer
        const response = await axios.put(`${API_URL}/users.php`, {
          id: formData.id,
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          membership: formData.membership,
          status: formData.status,
          notes: formData.notes
        }, { withCredentials: true });
        
        if (response.data.success) {
          alert('Pelanggan berhasil diperbarui!');
          fetchPelanggan();
          setShowFormModal(false);
        } else {
          alert(response.data.error || 'Gagal memperbarui pelanggan');
        }
      } else {
        // Create new customer
        const response = await axios.post(`${API_URL}/users.php`, {
          username: formData.username,
          email: formData.email,
          password: 'customer123',
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          membership: formData.membership,
          role: 'user'
        }, { withCredentials: true });
        
        if (response.data.success) {
          alert('Pelanggan berhasil ditambahkan!');
          fetchPelanggan();
          setShowFormModal(false);
        } else {
          alert(response.data.error || 'Gagal menambahkan pelanggan');
        }
      }
    } catch (error) {
      console.error("Error saving customer:", error);
      alert('Gagal menyimpan data pelanggan');
    }
  };

  const membershipCounts = membershipLevels.reduce((acc, level) => {
    acc[level.level] = pelanggan.filter(p => p.membership === level.level).length;
    return acc;
  }, {});

  const filteredPelanggan = pelanggan.filter(cust =>
    (cust.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     cust.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     cust.customer_id?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterMembership ? cust.membership === filterMembership : true) &&
    (filterStatus ? cust.status === filterStatus : true)
  );

  const totalPages = Math.ceil(filteredPelanggan.length / itemsPerPage);
  const paginatedPelanggan = filteredPelanggan.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatRupiah = (amount) => {
    return `Rp ${amount?.toLocaleString('id-ID') || 0}`;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800">Akses Ditolak</h2>
          <p className="text-gray-600 mt-2">Halaman ini hanya untuk administrator.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="p-6 md:p-8 bg-gradient-to-br from-orange-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 mb-8 bg-white rounded-2xl shadow-lg border-l-8 border-orange-500">
        <div>
          <h2 className="text-3xl font-extrabold text-orange-600">Manajemen Pelanggan</h2>
          <p className="text-gray-500 text-sm mt-1">Kelola data pelanggan Tenders PKU</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-3 rounded-full">
            <Users className="text-orange-600" size={24} />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/80 text-sm">Total Pelanggan</p>
              <p className="text-3xl font-bold mt-1">{pelanggan.length}</p>
            </div>
            <Users size={32} className="opacity-80" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-md border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Pelanggan Aktif</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{pelanggan.filter(p => p.status === 'active').length}</p>
            </div>
            <UserCheck size={28} className="text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-md border-l-4 border-red-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Pelanggan Nonaktif</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{pelanggan.filter(p => p.status === 'inactive').length}</p>
            </div>
            <UserX size={28} className="text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-md border-l-4 border-yellow-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Total Transaksi</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                {formatRupiah(pelanggan.reduce((sum, p) => sum + (p.totalTransaction || 0), 0))}
              </p>
            </div>
            <DollarSign size={28} className="text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Membership Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {membershipLevels.map((level) => (
          <div key={level.level} className="bg-white rounded-xl p-4 shadow-md text-center hover:shadow-lg transition">
            <div className="text-3xl mb-2">{level.icon}</div>
            <h3 className="font-bold text-gray-800">{level.level}</h3>
            <p className="text-2xl font-bold mt-1" style={{ color: level.color }}>{membershipCounts[level.level] || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Members</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari pelanggan (nama, email, ID)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              className="px-5 py-2.5 bg-orange-500 text-white rounded-xl flex items-center gap-2 hover:bg-orange-600 transition shadow-md"
            >
              <Plus size={18} /> Tambah Pelanggan
            </button>
            <button
              onClick={() => setShowFilterModal(true)}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl flex items-center gap-2 hover:bg-gray-200 transition"
            >
              <Filter size={18} /> Filter
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-orange-500 text-white">
                  <th className="px-5 py-4 text-left font-semibold">ID</th>
                  <th className="px-5 py-4 text-left font-semibold">Nama</th>
                  <th className="px-5 py-4 text-left font-semibold hidden md:table-cell">Email</th>
                  <th className="px-5 py-4 text-left font-semibold hidden lg:table-cell">Telepon</th>
                  <th className="px-5 py-4 text-left font-semibold">Membership</th>
                  <th className="px-5 py-4 text-left font-semibold">Status</th>
                  <th className="px-5 py-4 text-left font-semibold hidden xl:table-cell">Bergabung</th>
                  <th className="px-5 py-4 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPelanggan.map((cust, idx) => (
                  <tr key={cust.id} className={`border-b hover:bg-orange-50 transition cursor-pointer ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-5 py-4 font-mono text-xs text-gray-500">{cust.customer_id}</td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-800">{cust.name}</div>
                      <div className="text-xs text-gray-400 md:hidden">{cust.email}</div>
                    </td>
                    <td className="px-5 py-4 text-gray-600 hidden md:table-cell">{cust.email}</td>
                    <td className="px-5 py-4 text-gray-600 hidden lg:table-cell">{cust.phone}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-lg">{getMembershipIcon(cust.membership)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-${cust.membership === 'Classic' ? 'amber' : cust.membership === 'Silver' ? 'gray' : cust.membership === 'Gold' ? 'yellow' : 'orange'}-100 text-${cust.membership === 'Classic' ? 'amber' : cust.membership === 'Silver' ? 'gray' : cust.membership === 'Gold' ? 'yellow' : 'orange'}-700`}>
                          {cust.membership}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cust.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {cust.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs hidden xl:table-cell">{formatDate(cust.joinDate)}</td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(cust); }}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(cust.id, cust.customer_id); }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredPelanggan.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-5 bg-gray-50 border-t">
            <span className="text-sm text-gray-600">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredPelanggan.length)} dari {filteredPelanggan.length} pelanggan
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border bg-white text-sm disabled:opacity-50 hover:bg-gray-50 transition"
              >
                Sebelumnya
              </button>
              <div className="flex gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-xl text-sm transition ${currentPage === pageNum ? 'bg-orange-500 text-white' : 'bg-white border hover:bg-gray-50'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border bg-white text-sm disabled:opacity-50 hover:bg-gray-50 transition"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-orange-600">Filter Pelanggan</h2>
              <button onClick={() => setShowFilterModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Membership</label>
                <select
                  value={filterMembership}
                  onChange={(e) => setFilterMembership(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">Semua</option>
                  {membershipLevels.map(level => (
                    <option key={level.level} value={level.level}>{level.level} {level.icon}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">Semua</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setFilterMembership("");
                  setFilterStatus("");
                  setShowFilterModal(false);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-orange-600">
                {isEditing ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}
              </h2>
              <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-4">
              {!isEditing && (
                <>
                  <input
                    className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="Username *"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                  <input
                    className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="Email *"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </>
              )}
              <input
                className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Nama Lengkap"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
              <input
                className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Telepon"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <textarea
                className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Alamat"
                rows="2"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                  value={formData.membership}
                  onChange={(e) => setFormData({ ...formData, membership: e.target.value })}
                >
                  {membershipLevels.map(level => (
                    <option key={level.level} value={level.level}>{level.level} {level.icon}</option>
                  ))}
                </select>
                <select
                  className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
              <textarea
                className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Catatan (opsional)"
                rows="2"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowFormModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
              >
                Batal
              </button>
              <button
                onClick={handleFormSubmit}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
              >
                {isEditing ? "Simpan Perubahan" : "Tambah Pelanggan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </main>
  );
};

export default ManajemenPelangganPage;