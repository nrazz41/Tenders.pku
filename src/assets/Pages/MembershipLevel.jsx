import React, { useState, useMemo, useEffect } from "react";
import { 
  Plus, Trash2, Edit3, X, Save, 
  Search, Filter, Award, Calendar, Trophy, Star, Crown, ShieldCheck
} from "lucide-react";
import { supabase } from "../../services/supabaseClient";

const LoyaltyManagementPage = () => {
  // --- Theme Colors ---
  const primaryRed = '#B82329';
  
  // --- State ---
  const [membershipLevels, setMembershipLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  
  const initialForm = { 
    id: "", 
    level: "", 
    criteria: "", 
    points: "", 
    benefits: "", 
    color: "#B82329", 
    count: 0,
    min_transaction: 0,
    max_transaction: 0
  };
  const [formData, setFormData] = useState(initialForm);

  // Fetch data from Supabase
  useEffect(() => {
    fetchMembershipLevels();
  }, []);

  const fetchMembershipLevels = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('membership_levels')
        .select('*')
        .order('min_transaction', { ascending: true });

      if (error) throw error;
      setMembershipLevels(data || []);
    } catch (error) {
      console.error("Error fetching membership levels:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Filter Logic ---
  const filteredData = useMemo(() => {
    return membershipLevels.filter(lvl => 
      lvl.level?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lvl.criteria?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, membershipLevels]);

  // --- CRUD Functions ---
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
    setError(null);
    
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('membership_levels')
          .update({
            level: formData.level,
            criteria: formData.criteria,
            points: formData.points,
            benefits: formData.benefits,
            color: formData.color,
            count: formData.count,
            min_transaction: formData.min_transaction,
            max_transaction: formData.max_transaction,
            updated_at: new Date()
          })
          .eq('id', formData.id);

        if (error) throw error;
        alert("Konfigurasi Loyalty berhasil diperbarui!");
      } else {
        const { error } = await supabase
          .from('membership_levels')
          .insert([{
            level: formData.level,
            criteria: formData.criteria,
            points: formData.points,
            benefits: formData.benefits,
            color: formData.color,
            count: formData.count || 0,
            min_transaction: formData.min_transaction || 0,
            max_transaction: formData.max_transaction || 0,
            created_at: new Date(),
            updated_at: new Date()
          }]);

        if (error) throw error;
        alert("Konfigurasi Loyalty berhasil ditambahkan!");
      }
      
      setIsModalOpen(false);
      fetchMembershipLevels();
    } catch (error) {
      console.error("Error saving membership level:", error);
      setError(error.message);
      alert("Gagal menyimpan konfigurasi");
    }
  };

  const handleDelete = async (id, levelName) => {
    if (window.confirm(`Hapus level membership "${levelName}"?`)) {
      try {
        const { error } = await supabase
          .from('membership_levels')
          .delete()
          .eq('id', id);

        if (error) throw error;
        alert("Level membership berhasil dihapus!");
        fetchMembershipLevels();
      } catch (error) {
        console.error("Error deleting membership level:", error);
        alert("Gagal menghapus level membership");
      }
    }
  };

  const getLevelIcon = (level) => {
    switch (level?.toLowerCase()) {
      case 'classic': return <Star size={16} />;
      case 'silver': return <ShieldCheck size={16} />;
      case 'gold': return <Trophy size={16} />;
      case 'platinum': return <Crown size={16} />;
      default: return <Award size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FE] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderBottomColor: primaryRed }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F4F7FE] flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <p>Error: {error}</p>
          <button 
            onClick={fetchMembershipLevels}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE] p-6 font-sans text-gray-800">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#B82329]">Loyalty Management</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#B82329] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-black transition-all shadow-md"
        >
          <Plus size={18} /> Tambah Tier Baru
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-4 mb-8 items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" placeholder="Cari nama tier atau kriteria..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white shadow-sm font-bold text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-bold flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <span>Semua Status</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Tiers</p>
          <h3 className="text-3xl font-bold text-[#B82329]">{membershipLevels.length} Level</h3>
        </div>
        <div className="bg-[#B82329] p-6 rounded-xl shadow-md text-white">
          <p className="text-red-100 text-xs font-bold uppercase tracking-widest">Sistem Aktif</p>
          <h3 className="text-3xl font-bold">100%</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Populasi Tertinggi</p>
          <h3 className="text-3xl font-bold text-[#B82329]">
            {membershipLevels.reduce((highest, curr) => 
              (curr.count > highest.count ? curr : highest), { count: 0, level: 'Classic' }).level || 'Classic'
            }
          </h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Target Reward</p>
          <h3 className="text-2xl font-bold text-[#B82329]">Porsi Gratis</h3>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#B82329] text-white text-sm font-bold uppercase">
                <th className="px-6 py-4 text-center">Icon</th>
                <th className="px-6 py-4">Nama Tier</th>
                <th className="px-6 py-4">Kriteria Transaksi</th>
                <th className="px-6 py-4">Ratio Poin</th>
                <th className="px-6 py-4">Benefit</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    Belum ada data membership level
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-red-50 transition-colors">
                    <td className="px-6 py-5 text-center">
                      <div className="inline-block p-2 rounded-lg text-white" style={{ backgroundColor: item.color || primaryRed }}>
                        {getLevelIcon(item.level)}
                      </div>
                    </td>
                    <td className="px-6 py-5 font-bold text-gray-800 uppercase italic tracking-tighter">{item.level}</td>
                    <td className="px-6 py-5 text-sm font-bold text-gray-600">{item.criteria}</td>
                    <td className="px-6 py-5 text-sm font-black text-[#B82329]">{item.points}</td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-md">{item.benefits}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => handleOpenModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <Edit3 size={16}/>
                        </button>
                        <button onClick={() => handleDelete(item.id, item.level)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-6 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#B82329] p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold uppercase italic tracking-tighter">
                {isEditing ? "Edit" : "Tambah"} Loyalty Tier
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-all">
                <X size={24}/>
              </button>
            </div>
            <form className="p-8 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Nama Level Membership</label>
                <input required name="level" value={formData.level} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Kriteria (Jumlah Porsi)</label>
                <input required name="criteria" value={formData.criteria} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Aturan Poin</label>
                <input required name="points" value={formData.points} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Manfaat Utama</label>
                <textarea required name="benefits" value={formData.benefits} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold resize-none" rows="2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Warna Tema</label>
                  <input type="color" name="color" value={formData.color} onChange={handleInputChange} className="w-full h-12 bg-gray-50 border rounded-xl cursor-pointer" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Total Member</label>
                  <input type="number" name="count" value={formData.count} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Min Transaksi (Rp)</label>
                  <input type="number" name="min_transaction" value={formData.min_transaction} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Max Transaksi (Rp)</label>
                  <input type="number" name="max_transaction" value={formData.max_transaction} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold" />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-[#B82329] text-white rounded-xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2">
                <Save size={18} /> Simpan Konfigurasi
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyManagementPage;