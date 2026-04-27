// src/Pages/ProductManagement.jsx
import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Edit, Trash2, Box, PackageX, CheckCircle, Flame, Sparkles } from 'lucide-react';
import axios from 'axios';
import ProductForm from './ProductForm';

const API_URL = "http://127.0.0.1:8000/api";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Warna merah primary
  const primaryRed = '#B82329';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching products from:', `${API_URL}/products`);
      const response = await axios.get(`${API_URL}/products`);
      console.log('Products response:', response.data);
      
      if (response.data.success) {
        setProducts(response.data.data || []);
      } else {
        console.error("Failed to fetch products:", response.data.error);
        setError(response.data.error);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 20).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus produk ini?`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${API_URL}/products/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.data.success) {
          alert('Produk berhasil dihapus!');
          fetchProducts();
        } else {
          alert(response.data.error || 'Gagal menghapus produk');
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        alert(error.response?.data?.error || 'Gagal menghapus produk');
      }
    }
  };

  const handleSubmitProduct = async (productData) => {
    try {
      const token = localStorage.getItem('token');
      let response;
      
      if (productData.id) {
        response = await axios.put(`${API_URL}/products/${productData.id}`, productData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.data.success) {
          alert('Produk berhasil diperbarui!');
        }
      } else {
        response = await axios.post(`${API_URL}/products`, productData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.data.success) {
          alert('Produk berhasil ditambahkan!');
        }
      }
      
      if (response.data.success) {
        fetchProducts();
        setIsFormOpen(false);
      } else {
        alert(response.data.error || 'Gagal menyimpan produk');
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert(error.response?.data?.error || 'Gagal menyimpan produk');
    }
  };

  const getStatusClass = (status, stock) => {
    if (status === 'inactive') return 'bg-gray-100 text-gray-800';
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (stock <= 20) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (status, stock) => {
    if (status === 'inactive') return 'Inactive';
    if (stock === 0) return 'Habis';
    if (stock <= 20) return 'Stok Rendah';
    return 'Aktif';
  };

  const getCategoryBadgeClass = (category) => {
    const classes = {
      tender: 'bg-red-100 text-red-700',
      mozzville: 'bg-red-100 text-red-700',
      sides: 'bg-yellow-100 text-yellow-700',
      beverages: 'bg-blue-100 text-blue-700',
      sauce: 'bg-purple-100 text-purple-700',
    };
    return classes[category] || 'bg-gray-100 text-gray-700';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      tender: 'Chicken Tender',
      mozzville: 'Hot Mozzville',
      sides: 'Sides',
      beverages: 'Beverages',
      sauce: 'Sauce',
    };
    return labels[category] || category;
  };

  const formatRupiah = (price) => {
    return `Rp ${price?.toLocaleString('id-ID') || 0}`;
  };

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error: {error}</p>
          <p className="text-sm mt-2">Pastikan backend Laravel berjalan di http://127.0.0.1:8000</p>
          <button 
            onClick={fetchProducts}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* Header - warna merah */}
      <div className="flex justify-between items-center px-6 py-4 mb-8 bg-white rounded-xl shadow-lg border-b-4" style={{ borderColor: primaryRed }}>
        <h2 className="text-3xl font-extrabold tracking-wide" style={{ color: primaryRed }}>Manajemen Produk</h2>
        <button
          onClick={handleAddProduct}
          className="flex items-center gap-2 px-5 py-2.5 text-white rounded-lg transition-all shadow-md"
          style={{ backgroundColor: primaryRed }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#8B1A1F'}
          onMouseLeave={(e) => e.target.style.backgroundColor = primaryRed}
        >
          <PlusCircle className="w-5 h-5" />
          <span>Tambah Produk</span>
        </button>
      </div>

      {/* Stats Cards - border warna merah */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 hover:shadow-lg transition" style={{ borderLeftColor: primaryRed }}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Total Produk</p>
              <p className="text-3xl font-bold text-gray-800">{totalProducts}</p>
            </div>
            <Box className="w-10 h-10" style={{ color: primaryRed }} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 hover:shadow-lg transition">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Produk Aktif</p>
              <p className="text-3xl font-bold text-gray-800">{activeProducts}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500 hover:shadow-lg transition">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Stok Rendah</p>
              <p className="text-3xl font-bold text-gray-800">{lowStockProducts}</p>
            </div>
            <PackageX className="w-10 h-10 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500 hover:shadow-lg transition">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Stok Habis</p>
              <p className="text-3xl font-bold text-gray-800">{outOfStockProducts}</p>
            </div>
            <Trash2 className="w-10 h-10 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Cari produk..."
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2"
              style={{ focusRingColor: primaryRed }}
              onFocus={(e) => e.target.style.setProperty('--tw-ring-color', primaryRed)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          <select
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 w-full md:w-48 bg-white text-gray-700"
            style={{ focusRingColor: primaryRed }}
            onFocus={(e) => e.target.style.setProperty('--tw-ring-color', primaryRed)}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'All' ? 'Semua Kategori' : getCategoryLabel(category)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table - Header warna merah */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderBottomColor: primaryRed }}></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead style={{ backgroundColor: primaryRed }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-white">Gambar</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-white">Nama Produk</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-white">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-white">Stok</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-white">Harga</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-white">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-white">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-red-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img 
                          src={product.image_url || '/images/default-product.png'} 
                          alt={product.name} 
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          onError={(e) => { e.target.src = '/images/default-product.png' }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">{product.name}</div>
                        {product.is_popular && (
                          <span className="inline-flex items-center gap-1 text-xs mt-1" style={{ color: primaryRed }}>
                            <Flame size={12} /> Best Seller
                          </span>
                        )}
                        {product.is_new && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-500 ml-2">
                            <Sparkles size={12} /> New
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeClass(product.category)}`}>
                          {getCategoryLabel(product.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{product.stock}</td>
                      <td className="px-6 py-4 font-semibold" style={{ color: primaryRed }}>{formatRupiah(product.price)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(product.status, product.stock)}`}>
                          {getStatusText(product.status, product.stock)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      {searchTerm || filterCategory !== 'All' 
                        ? 'Tidak ada produk yang sesuai dengan pencarian.'
                        : 'Belum ada produk. Klik "Tambah Produk" untuk memulai.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      <ProductForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitProduct}
        initialData={editingProduct}
        primaryColor={primaryRed}
      />
    </div>
  );
};

export default ProductManagement;