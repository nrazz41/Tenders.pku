// src/assets/Pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  User,
  MapPin,
  History,
  Settings,
  LogOut,
  Edit,
  Trash2,
  PlusCircle,
  Bell,
  Mail,
  MessageSquare,
  X,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Package,
  Star,
  Flame,
  Search,
  ShoppingCart,
  Menu,
  Phone,
  MapPinIcon,
  Clock,
} from 'lucide-react';

const API_URL = "http://127.0.0.1:8000/api";

const formatCurrency = (amount) => {
  const num = Number(amount ?? 0);
  if (isNaN(num)) return "Rp 0";
  return `Rp ${num.toLocaleString('id-ID')}`;
};

// ============================================
// MODAL ALAMAT
// ============================================
const AddressFormModal = ({ isOpen, onClose, onSave, address }) => {
  const [formData, setFormData] = useState({});
  
  useEffect(() => {
    setFormData(address ? { ...address } : { 
      id: null, 
      label: '', 
      recipient: '', 
      phone: '', 
      fullAddress: '', 
      isPrimary: false 
    });
  }, [address, isOpen]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in-up">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center p-5 border-b">
            <h3 className="text-xl font-bold text-gray-900">{address ? 'Edit Alamat' : 'Tambah Alamat Baru'}</h3>
            <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700">Label Alamat</label>
              <input type="text" name="label" value={formData.label || ''} onChange={handleChange} 
                placeholder="Contoh: Rumah, Kantor" className="mt-1 w-full p-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Penerima</label>
              <input type="text" name="recipient" value={formData.recipient || ''} onChange={handleChange} 
                className="mt-1 w-full p-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nomor Telepon</label>
              <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} 
                className="mt-1 w-full p-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Alamat Lengkap</label>
              <textarea name="fullAddress" value={formData.fullAddress || ''} onChange={handleChange} 
                rows="3" className="mt-1 w-full p-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500" required />
            </div>
            <div className="flex items-center">
              <input type="checkbox" name="isPrimary" id="isPrimary" checked={formData.isPrimary || false} 
                onChange={handleChange} className="h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />
              <label htmlFor="isPrimary" className="ml-2 block text-sm text-gray-900">Jadikan alamat utama</label>
            </div>
          </div>
          
          <div className="p-5 border-t bg-gray-50 flex justify-end rounded-b-2xl">
            <button type="submit" className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// MODAL KONFIRMASI HAPUS
// ============================================
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, addressLabel }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center animate-fade-in-up">
        <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
        <h3 className="text-xl font-bold text-gray-900">Hapus Alamat?</h3>
        <p className="text-gray-600 text-sm mt-2 mb-6">
          Apakah Anda yakin ingin menghapus alamat <span className="font-bold">{addressLabel}</span>?
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={onClose} className="px-8 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Batal</button>
          <button onClick={onConfirm} className="px-8 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600">Ya, Hapus</button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// TOGGLE SWITCH
// ============================================
const ToggleSwitch = ({ label, description, icon: Icon, enabled, setEnabled }) => (
  <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-orange-50 transition">
    <div className="flex items-center gap-4">
      <Icon className="text-orange-500" size={24} />
      <div>
        <p className="font-semibold text-gray-800">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
    <button 
      onClick={() => setEnabled(!enabled)} 
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-orange-500' : 'bg-gray-300'}`}
    >
      <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

// ============================================
// SIDEBAR NAVIGASI
// ============================================
const ProfileSidebar = ({ user, activeSection, setActiveSection }) => {
  const navItems = [
    { id: 'profil', label: 'Edit Profil', icon: User },
    { id: 'alamat', label: 'Alamat Saya', icon: MapPin },
    { id: 'riwayat', label: 'Riwayat Pesanan', icon: History },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
    { id: 'logout', label: 'Keluar', icon: LogOut, isDanger: true },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
      <div className="p-6 text-center border-b border-gray-100">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold">
            {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </div>
          <button className="absolute -bottom-1 -right-1 bg-orange-500 text-white p-1.5 rounded-full border-2 border-white hover:bg-orange-600 transition">
            <Edit size={12} />
          </button>
        </div>
        <h2 className="text-lg font-bold text-gray-800 mt-3">{user?.full_name || user?.username}</h2>
        <p className="text-xs text-gray-500">{user?.email}</p>
      </div>
      
      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'riwayat') {
                window.location.href = '/riwayat-pesanan';
              } else {
                setActiveSection(item.id);
              }
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeSection === item.id 
                ? 'bg-orange-50 text-orange-600' 
                : item.isDanger 
                  ? 'text-red-500 hover:bg-red-50' 
                  : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

// ============================================
// KOMPONEN UTAMA PROFILE PAGE
// ============================================
const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState('profil');
  const [addresses, setAddresses] = useState([]);
  const [isAddressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form profil
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    address: '',
  });
  
  // Pengaturan notifikasi
  const [settings, setSettings] = useState({
    promoEmail: true,
    orderStatus: true,
    news: false,
  });

  // Load user dari localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setProfileForm({
          full_name: parsedUser.full_name || '',
          phone: parsedUser.phone || '',
          address: parsedUser.address || '',
        });
      } catch(e) {}
    }
    loadAddresses();
    setLoading(false);
  }, []);

  const loadAddresses = () => {
    const savedAddresses = localStorage.getItem('user_addresses');
    if (savedAddresses) {
      setAddresses(JSON.parse(savedAddresses));
    } else {
      const defaultAddresses = [
        { id: 1, label: "Rumah", recipient: user?.full_name || "Customer", phone: user?.phone || "08123456789", fullAddress: "Jl. Hangtuah (Depan Plaza Kado), Pekanbaru", isPrimary: true },
      ];
      setAddresses(defaultAddresses);
      localStorage.setItem('user_addresses', JSON.stringify(defaultAddresses));
    }
  };

  const handleOpenAddressModal = (address = null) => {
    setEditingAddress(address);
    setAddressModalOpen(true);
  };

  const handleSaveAddress = (formData) => {
    let newAddresses = [...addresses];
    if (formData.isPrimary) {
      newAddresses = newAddresses.map(addr => ({ ...addr, isPrimary: false }));
    }
    if (editingAddress) {
      newAddresses = newAddresses.map(addr => addr.id === editingAddress.id ? { ...formData, id: editingAddress.id } : addr);
    } else {
      const newId = Math.max(...addresses.map(a => a.id), 0) + 1;
      newAddresses.push({ ...formData, id: newId });
    }
    setAddresses(newAddresses);
    localStorage.setItem('user_addresses', JSON.stringify(newAddresses));
    setAddressModalOpen(false);
  };

  const handleConfirmDelete = () => {
    setAddresses(addresses.filter(addr => addr.id !== addressToDelete.id));
    localStorage.setItem('user_addresses', JSON.stringify(addresses.filter(addr => addr.id !== addressToDelete.id)));
    setAddressToDelete(null);
  };

  const handleSetPrimary = (addressId) => {
    const newAddresses = addresses.map(addr => ({ ...addr, isPrimary: addr.id === addressId }));
    setAddresses(newAddresses);
    localStorage.setItem('user_addresses', JSON.stringify(newAddresses));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Silakan login terlebih dahulu");
      return;
    }
    
    try {
      // Update user via API
      const response = await axios.put(`${API_URL}/user/profile`, profileForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        // Update localStorage
        const updatedUser = { ...user, ...profileForm };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        alert("Profil berhasil diperbarui!");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Gagal memperbarui profil");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user_addresses');
    navigate("/login");
  };

  const handleSaveSettings = () => {
    localStorage.setItem('user_settings', JSON.stringify(settings));
    alert("Pengaturan berhasil disimpan!");
  };

  const handleSaveProfile = () => {
    alert("Profil berhasil diperbarui!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <>
      <AddressFormModal 
        isOpen={isAddressModalOpen} 
        onClose={() => setAddressModalOpen(false)}
        onSave={handleSaveAddress}
        address={editingAddress}
      />
      <ConfirmDeleteModal 
        isOpen={!!addressToDelete}
        onClose={() => setAddressToDelete(null)}
        onConfirm={handleConfirmDelete}
        addressLabel={addressToDelete?.label}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-2">
                <img src="/images/Logo.png" alt="Tenders PKU" className="w-10 h-10 rounded-full border-2 border-orange-500" />
                <div>
                  <span className="font-bold text-xl text-orange-600">TENDERS</span>
                  <span className="font-bold text-xl text-gray-800"> PKU</span>
                </div>
              </Link>
              <h1 className="text-xl font-bold text-gray-800">Profil Saya</h1>
              <div className="w-10"></div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ProfileSidebar 
                user={user}
                activeSection={activeSection} 
                setActiveSection={setActiveSection} 
              />
            </div>
            
            {/* Content */}
            <div className="lg:col-span-3">
              {activeSection === 'profil' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Edit Profil</h2>
                  <p className="text-gray-500 text-sm mb-6">Kelola informasi akun Anda</p>
                  
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                        <input
                          type="text"
                          value={profileForm.full_name}
                          onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                        <input
                          type="text"
                          value={user?.username || ''}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                          disabled
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
                      <textarea
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                        placeholder="Jl. Hangtuah (Depan Plaza Kado), Pekanbaru"
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <button type="submit" className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition shadow-md">
                        Simpan Perubahan
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {activeSection === 'alamat' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                  <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Alamat Saya</h2>
                      <p className="text-gray-500 text-sm">Kelola alamat pengiriman Anda</p>
                    </div>
                    <button 
                      onClick={() => handleOpenAddressModal()}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition"
                    >
                      <PlusCircle size={18} /> Tambah Alamat
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {addresses.length === 0 ? (
                      <div className="text-center py-12">
                        <MapPin className="mx-auto text-gray-300 mb-3" size={48} />
                        <p className="text-gray-500">Belum ada alamat tersimpan</p>
                      </div>
                    ) : (
                      addresses.map(addr => (
                        <div key={addr.id} className={`p-5 border-2 rounded-xl transition-all ${addr.isPrimary ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}`}>
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <h4 className="font-bold text-gray-800">{addr.label}</h4>
                              {addr.isPrimary && (
                                <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">Utama</span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleOpenAddressModal(addr)} className="p-2 text-gray-500 hover:text-blue-500 transition">
                                <Edit size={16} />
                              </button>
                              <button onClick={() => setAddressToDelete(addr)} className="p-2 text-gray-500 hover:text-red-500 transition">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="mt-3 text-sm">
                            <p className="font-semibold text-gray-700">{addr.recipient} ({addr.phone})</p>
                            <p className="text-gray-600 mt-1">{addr.fullAddress}</p>
                          </div>
                          {!addr.isPrimary && (
                            <div className="mt-3 pt-3 border-t">
                              <button onClick={() => handleSetPrimary(addr.id)} className="text-sm font-semibold text-orange-500 hover:underline">
                                Jadikan Alamat Utama
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              
              {activeSection === 'pengaturan' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Pengaturan Notifikasi</h2>
                  <p className="text-gray-500 text-sm mb-6">Atur preferensi notifikasi Anda</p>
                  
                  <div className="space-y-4">
                    <ToggleSwitch 
                      label="Notifikasi Promo" 
                      description="Terima info promo & diskon terbaru" 
                      icon={Mail} 
                      enabled={settings.promoEmail} 
                      setEnabled={(val) => setSettings({...settings, promoEmail: val})} 
                    />
                    <ToggleSwitch 
                      label="Notifikasi Status Pesanan" 
                      description="Dapatkan update status pesanan" 
                      icon={MessageSquare} 
                      enabled={settings.orderStatus} 
                      setEnabled={(val) => setSettings({...settings, orderStatus: val})} 
                    />
                    <ToggleSwitch 
                      label="Newsletter" 
                      description="Berlangganan berita & promo mingguan" 
                      icon={Bell} 
                      enabled={settings.news} 
                      setEnabled={(val) => setSettings({...settings, news: val})} 
                    />
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <button onClick={handleSaveSettings} className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition">
                      Simpan Pengaturan
                    </button>
                  </div>
                </div>
              )}
              
              {activeSection === 'logout' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                  <div className="max-w-sm mx-auto">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <LogOut className="text-red-500" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Keluar dari Akun</h2>
                    <p className="text-gray-500 mb-8">Apakah Anda yakin ingin keluar dari akun TENDERS PKU?</p>
                    <div className="flex gap-4">
                      <button onClick={() => setActiveSection('profil')} className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition">
                        Batal
                      </button>
                      <button onClick={handleLogout} className="flex-1 px-6 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition">
                        Keluar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default ProfilePage;