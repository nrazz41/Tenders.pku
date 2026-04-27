// src/assets/Pages/ComboForm.jsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const ComboForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
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
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        items: initialData.items || "",
        price: initialData.price || "",
        original_price: initialData.original_price || "",
        discount: initialData.discount || 0,
        image_url: initialData.image_url || "/images/combo-default.png",
        is_active: initialData.is_active ?? true,
      });
    } else {
      setFormData({ name: "", description: "", items: "", price: "", original_price: "", discount: 0, image_url: "/images/combo-default.png", is_active: true });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b"><h2 className="text-xl font-bold text-orange-600">{initialData ? "Edit Paket Hemat" : "Tambah Paket Hemat"}</h2><button onClick={onClose}><X size={20} /></button></div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div><label className="block text-sm font-medium mb-1">Nama Paket *</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required /></div>
          <div><label className="block text-sm font-medium mb-1">Deskripsi</label><textarea name="description" value={formData.description} onChange={handleChange} rows="2" className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-1">Item Paket *</label><textarea name="items" value={formData.items} onChange={handleChange} rows="3" className="w-full px-3 py-2 border rounded-lg" placeholder="2 Chicken Tender + 1 Hot Mozzville + Fries + Drink" required /></div>
          <div className="grid grid-cols-2 gap-3"><div><label>Harga *</label><input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required /></div><div><label>Harga Coret</label><input type="number" name="original_price" value={formData.original_price} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" /></div></div>
          <div><label>Diskon (%)</label><input type="number" name="discount" value={formData.discount} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" min="0" max="100" /></div>
          <div><label>URL Gambar</label><input type="text" name="image_url" value={formData.image_url} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div className="flex items-center gap-2"><input type="checkbox" name="is_active" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} className="w-4 h-4" /><label>Aktifkan paket ini</label></div>
          <div className="flex justify-end gap-3 pt-4 border-t"><button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">Batal</button><button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-lg">Simpan</button></div>
        </form>
      </div>
    </div>
  );
};

export default ComboForm;