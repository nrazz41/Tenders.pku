// src/Pages/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ProductForm = ({ isOpen, onClose, onSubmit, initialData, primaryColor }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'tender',
    stock: 0,
    image_url: '',
    is_popular: false,
    is_new: false,
    spice_level: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || 0,
        category: initialData.category || 'tender',
        stock: initialData.stock || 0,
        image_url: initialData.image_url || '',
        is_popular: initialData.is_popular || false,
        is_new: initialData.is_new || false,
        spice_level: initialData.spice_level || 0,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: 'tender',
        stock: 0,
        image_url: '',
        is_popular: false,
        is_new: false,
        spice_level: 0,
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold" style={{ color: primaryColor }}>
            {initialData ? 'Edit Produk' : 'Tambah Produk'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="tender">Chicken Tender</option>
                <option value="wings">Wings</option>
                <option value="mozzville">Hot Mozzville</option>
                <option value="sides">Sides</option>
                <option value="beverages">Beverages</option>
                <option value="sauce">Sauce</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harga</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level Pedas</label>
              <select
                name="spice_level"
                value={formData.spice_level}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="0">Tidak Pedas</option>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
                <option value="4">Level 4</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
            <input
              type="text"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              placeholder="https://... atau /images/..."
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_popular"
                checked={formData.is_popular}
                onChange={handleChange}
              />
              <span className="text-sm">Best Seller</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_new"
                checked={formData.is_new}
                onChange={handleChange}
              />
              <span className="text-sm">Produk Baru</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Batal
            </button>
            <button type="submit" className="px-4 py-2 text-white rounded-lg hover:bg-red-700" style={{ backgroundColor: primaryColor }}>
              {initialData ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;