// src/Pages/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

const API_URL = "http://127.0.0.1:8000/api";

const ProductForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    description: '',
    price: '',
    original_price: '',
    category: 'tender',
    stock: 99,
    image_url: '',
    is_popular: false,
    is_new: false,
    spice_level: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || '',
        original_price: initialData.original_price || '',
        category: initialData.category || 'tender',
        stock: initialData.stock || 99,
        image_url: initialData.image_url || '',
        is_popular: initialData.is_popular == 1 || initialData.is_popular === true,
        is_new: initialData.is_new == 1 || initialData.is_new === true,
        spice_level: initialData.spice_level || 0,
      });
      if (initialData.image_url) {
        setImagePreview(initialData.image_url);
      }
    } else {
      setFormData({
        id: null,
        name: '',
        description: '',
        price: '',
        original_price: '',
        category: 'tender',
        stock: 99,
        image_url: '',
        is_popular: false,
        is_new: false,
        spice_level: 0,
      });
      setImagePreview(null);
    }
    setError('');
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // You can upload to server here or just store the filename
      setFormData(prev => ({
        ...prev,
        image_url: `/images/${file.name}`
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validasi
    if (!formData.name.trim()) {
      setError('Nama produk harus diisi');
      setIsSubmitting(false);
      return;
    }
    if (!formData.price || formData.price <= 0) {
      setError('Harga harus diisi dan lebih dari 0');
      setIsSubmitting(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Anda harus login sebagai admin');
      setIsSubmitting(false);
      return;
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      category: formData.category,
      stock: parseInt(formData.stock),
      image_url: formData.image_url || '/images/default-product.png',
      is_popular: formData.is_popular,
      is_new: formData.is_new,
      spice_level: parseInt(formData.spice_level),
    };

    try {
      let response;
      if (formData.id) {
        // Update product
        response = await axios.put(`${API_URL}/products/${formData.id}`, productData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        // Create new product
        response = await axios.post(`${API_URL}/products`, productData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      if (response.data.success) {
        alert(formData.id ? 'Produk berhasil diperbarui!' : 'Produk berhasil ditambahkan!');
        onSubmit && onSubmit(response.data.data);
        onClose();
      } else {
        setError(response.data.error || 'Gagal menyimpan produk');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      if (error.response?.status === 401) {
        setError('Sesi login habis. Silakan login kembali.');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { value: 'tender', label: '🍗 Chicken Tender', color: 'orange' },
    { value: 'mozzville', label: '🧀 Hot Mozzville', color: 'red' },
    { value: 'sides', label: '🍟 Sides', color: 'yellow' },
    { value: 'beverages', label: '🥤 Beverages', color: 'blue' },
    { value: 'sauce', label: '🥫 Sauce', color: 'purple' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-orange-600">
            {formData.id ? '✏️ Edit Produk' : '➕ Tambah Produk Baru'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Nama Produk */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Produk <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Contoh: Original Chicken Tender"
              required
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Deskripsi produk..."
            />
          </div>

          {/* Harga dan Kategori */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="25000"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Harga Original dan Stok */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Coret (Original)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                <input
                  type="number"
                  name="original_price"
                  value={formData.original_price}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="30000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stok
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="99"
              />
            </div>
          </div>

          {/* Level Pedas dan Gambar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Level Pedas
              </label>
              <select
                name="spice_level"
                value={formData.spice_level}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value={0}>🌶️ Tidak Pedas</option>
                <option value={1}>🌶️ Level 1 - Mild</option>
                <option value={2}>🌶️🌶️ Level 2 - Hot</option>
                <option value={3}>🌶️🌶️🌶️ Level 3 - Extreme Hot</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Gambar
              </label>
              <input
                type="text"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="/images/nama-file.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Upload Gambar Alternative */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Gambar (Alternative)
            </label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition">
                <Upload size={18} />
                <span>Pilih File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imagePreview && (
                <div className="flex items-center gap-2">
                  <img src={imagePreview} alt="Preview" className="w-10 h-10 rounded object-cover" />
                  <span className="text-xs text-green-600">Gambar siap</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">Upload gambar ke folder public/images/</p>
          </div>

          {/* Checkbox Popular & New */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_popular"
                checked={formData.is_popular}
                onChange={handleChange}
                className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
              />
              <span className="text-sm">🔥 Produk Populer (Best Seller)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_new"
                checked={formData.is_new}
                onChange={handleChange}
                className="w-4 h-4 text-green-500 rounded focus:ring-green-500"
              />
              <span className="text-sm">✨ Produk Baru (New)</span>
            </label>
          </div>

          {/* Preview Data */}
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-orange-700 mb-2">Preview:</p>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-800">{formData.name || 'Nama Produk'}</p>
                <p className="text-orange-600 font-bold">
                  Rp {parseInt(formData.price || 0).toLocaleString('id-ID')}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500">{categories.find(c => c.value === formData.category)?.label || 'Kategori'}</span>
                <p className="text-xs text-gray-500">Stok: {formData.stock || 0}</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Menyimpan...
                </span>
              ) : (
                formData.id ? 'Update Produk' : 'Simpan Produk'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;