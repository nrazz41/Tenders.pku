// src/assets/Pages/ComboForm.jsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const PRIMARY_RED = "#B82329";

const ComboForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    description: "",
    items: "",
    price: "",
    original_price: "",
    discount: "",
    image_url: "/images/combo-default.png",
    is_active: true,
  });

  useEffect(() => {
    if (initialData && initialData.id) {
      // EDIT MODE - ada ID
      // Handle items yang mungkin berupa string atau object
      let itemsValue = initialData.items || "";
      if (typeof initialData.items === 'object' && initialData.items !== null) {
        // Konversi dari object ke string simple
        if (Array.isArray(initialData.items)) {
          itemsValue = initialData.items.map(item => 
            `${item.item} ${item.quantity ? `(${item.quantity}pcs)` : ''}`
          ).join(', ');
        } else {
          itemsValue = JSON.stringify(initialData.items);
        }
      }
      
      setFormData({
        id: initialData.id,
        name: initialData.name || "",
        description: initialData.description || "",
        items: itemsValue,
        price: initialData.price || "",
        original_price: initialData.original_price || "",
        discount: initialData.discount || 0,
        image_url: initialData.image_url || "/images/combo-default.png",
        is_active: initialData.is_active ?? true,
      });
    } else {
      // ADD MODE - tanpa ID
      setFormData({
        id: null,
        name: "",
        description: "",
        items: "",
        price: "",
        original_price: "",
        discount: 0,
        image_url: "/images/combo-default.png",
        is_active: true,
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Konversi items dari teks biasa ke format yang lebih terstruktur
    let itemsFormatted = formData.items;
    // Jika ingin simpan sebagai array (opsional)
    // const itemsArray = formData.items.split(',').map(item => ({ item: item.trim(), quantity: 1 }));
    
    const submitData = {
      id: formData.id,
      name: formData.name,
      description: formData.description,
      items: formData.items, // Simpan sebagai teks biasa
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      discount: parseInt(formData.discount) || 0,
      image_url: formData.image_url,
      is_active: formData.is_active,
    };
    
    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b" style={{ borderBottomColor: `${PRIMARY_RED}30` }}>
          <h2 className="text-xl font-bold" style={{ color: PRIMARY_RED }}>
            {initialData?.id ? "Edit Paket Hemat" : "Tambah Paket Hemat"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Nama Paket */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Paket *</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white/80"
              placeholder="Contoh: Happy Hour Combo"
              required 
            />
          </div>
          
          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows="2" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white/80"
              placeholder="Deskripsi singkat tentang paket ini"
            />
          </div>
          
          {/* Item Paket - TEXT biasa, bukan JSON */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Paket *
            </label>
            <textarea 
              name="items" 
              value={formData.items} 
              onChange={handleChange} 
              rows="3" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white/80"
              placeholder="Chicken Tender 3 pcs&#10;Spicy Wings 2 pcs&#10;Hot Mozzville 1 pcs"
              required 
            />
            <p className="text-xs text-gray-400 mt-1">
              Pisahkan setiap item dengan baris baru
            </p>
          </div>
          
          {/* Harga */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harga *</label>
              <input 
                type="number" 
                name="price" 
                value={formData.price} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white/80"
                placeholder="25000"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harga Coret</label>
              <input 
                type="number" 
                name="original_price" 
                value={formData.original_price} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white/80"
                placeholder="35000"
              />
            </div>
          </div>
          
          {/* Diskon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diskon (%)</label>
            <input 
              type="number" 
              name="discount" 
              value={formData.discount} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white/80"
              placeholder="0"
              min="0" 
              max="100" 
            />
          </div>
          
          {/* URL Gambar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
            <input 
              type="text" 
              name="image_url" 
              value={formData.image_url} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white/80"
              placeholder="/images/combo-default.png"
            />
            <p className="text-xs text-gray-400 mt-1">
              Kosongkan untuk menggunakan gambar default
            </p>
          </div>
          
          {/* Active Checkbox */}
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              name="is_active" 
              checked={formData.is_active} 
              onChange={handleChange} 
              className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
            />
            <label className="text-sm text-gray-700">Aktifkan paket ini</label>
          </div>
          
          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderTopColor: `${PRIMARY_RED}30` }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 text-white rounded-lg hover:bg-red-700 transition shadow-md"
              style={{ backgroundColor: PRIMARY_RED }}
            >
              {initialData?.id ? "Update Paket" : "Simpan Paket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComboForm;