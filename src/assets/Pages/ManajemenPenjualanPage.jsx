// src/assets/Pages/ManajemenPenjualanPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  X,
  Package,
  Smartphone,
  Store,
} from "lucide-react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";
const PRIMARY_RED = "#B82329";

const formatRupiah = (amount) => {
  const num = Number(amount ?? 0);
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
    hour: "2-digit",
    minute: "2-digit",
  });
};

// TransactionModal
const TransactionModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  products,
}) => {
  const [formData, setFormData] = useState({
    order_number: "",
    customer_name: "",
    items: [{ product_id: "", quantity: 1, price: 0 }],
    total_amount: 0,
    payment_method: "cash",
    source: "offline",
    notes: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        order_number: initialData.order_number || `ORD-${Date.now()}`,
        customer_name: initialData.customer_name || "",
        items: initialData.items || [{ product_id: "", quantity: 1, price: 0 }],
        total_amount: initialData.total_amount || 0,
        payment_method: initialData.payment_method || "cash",
        source: initialData.source || "offline",
        notes: initialData.notes || "",
      });
    } else {
      setFormData({
        order_number: `ORD-${Date.now()}`,
        customer_name: "",
        items: [{ product_id: "", quantity: 1, price: 0 }],
        total_amount: 0,
        payment_method: "cash",
        source: "offline",
        notes: "",
      });
    }
  }, [initialData, isOpen]);

  const handleItemChange = (idx, field, value) => {
    const newItems = [...formData.items];
    newItems[idx][field] = value;
    if (field === "product_id") {
      const product = products.find((p) => p.id == value);
      if (product) {
        newItems[idx].price = product.price;
      }
    }
    const newTotal = newItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    setFormData({ ...formData, items: newItems, total_amount: newTotal });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: "", quantity: 1, price: 0 }],
    });
  };

  const removeItem = (idx) => {
    if (formData.items.length === 1) {
      alert("Minimal harus ada 1 produk");
      return;
    }
    const newItems = formData.items.filter((_, i) => i !== idx);
    const newTotal = newItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    setFormData({
      ...formData,
      items: newItems,
      total_amount: newTotal,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const hasEmptyProduct = formData.items.some((item) => !item.product_id);
    if (hasEmptyProduct) {
      alert("Silakan pilih produk untuk semua baris");
      return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold" style={{ color: PRIMARY_RED }}>
            {initialData ? "Edit Transaksi" : "Tambah Transaksi Baru"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
              <input type="text" value={formData.order_number} readOnly className="w-full px-3 py-2 border rounded-lg bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pelanggan</label>
              <input type="text" value={formData.customer_name} onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-400" placeholder="Walk-in Customer" />
            </div>
          </div>

          {/* Sumber Transaksi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sumber Transaksi</label>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => setFormData({ ...formData, source: "offline" })} className={`p-2 rounded-lg border flex items-center justify-center gap-2 transition ${formData.source === "offline" ? "text-white border-red-500" : "bg-white border-gray-300"}`} style={formData.source === "offline" ? { backgroundColor: PRIMARY_RED } : {}}><Store size={16} /> Offline (Toko)</button>
              <button type="button" onClick={() => setFormData({ ...formData, source: "gofood" })} className={`p-2 rounded-lg border flex items-center justify-center gap-2 transition ${formData.source === "gofood" ? "bg-green-500 text-white border-green-500" : "bg-white border-gray-300"}`}><Smartphone size={16} /> GoFood</button>
              <button type="button" onClick={() => setFormData({ ...formData, source: "shopeefood" })} className={`p-2 rounded-lg border flex items-center justify-center gap-2 transition ${formData.source === "shopeefood" ? "text-white" : "bg-white border-gray-300"}`} style={formData.source === "shopeefood" ? { backgroundColor: PRIMARY_RED } : {}}><Package size={16} /> ShopeeFood</button>
            </div>
          </div>

          {/* Metode Pembayaran */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Metode Pembayaran</label>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => setFormData({ ...formData, payment_method: "cash" })} className={`p-2 rounded-lg border flex items-center justify-center gap-2 transition ${formData.payment_method === "cash" ? "bg-green-500 text-white" : "bg-white border-gray-300"}`}>💵 Cash</button>
              <button type="button" onClick={() => setFormData({ ...formData, payment_method: "qris" })} className={`p-2 rounded-lg border flex items-center justify-center gap-2 transition ${formData.payment_method === "qris" ? "bg-blue-500 text-white" : "bg-white border-gray-300"}`}>📱 QRIS</button>
              <button type="button" onClick={() => setFormData({ ...formData, payment_method: "transfer" })} className={`p-2 rounded-lg border flex items-center justify-center gap-2 transition ${formData.payment_method === "transfer" ? "bg-purple-500 text-white" : "bg-white border-gray-300"}`}>🏦 Transfer</button>
            </div>
          </div>

          {/* Produk yang Dibeli */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Produk yang Dibeli</label>
            <div className="space-y-2">
              {formData.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg">
                  <select value={item.product_id} onChange={(e) => handleItemChange(idx, "product_id", e.target.value)} className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-400" required>
                    <option value="">Pilih Produk</option>
                    {products.map((p) => (<option key={p.id} value={p.id}>{p.name} - {formatRupiah(p.price)}</option>))}
                  </select>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => handleItemChange(idx, "quantity", Math.max(1, item.quantity - 1))} className="w-8 h-8 rounded-lg border bg-white hover:bg-gray-100">-</button>
                    <input type="number" value={item.quantity} onChange={(e) => handleItemChange(idx, "quantity", Math.max(1, parseInt(e.target.value) || 1))} className="w-16 px-2 py-2 border rounded-lg text-center" min="1" />
                    <button type="button" onClick={() => handleItemChange(idx, "quantity", item.quantity + 1)} className="w-8 h-8 rounded-lg border bg-white hover:bg-gray-100">+</button>
                  </div>
                  <span className="w-24 text-right text-sm font-semibold" style={{ color: PRIMARY_RED }}>{formatRupiah(item.price * item.quantity)}</span>
                  <button type="button" onClick={() => removeItem(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
                </div>
              ))}
              <button type="button" onClick={addItem} className="w-full py-2 border border-dashed rounded-lg transition flex items-center justify-center gap-2" style={{ borderColor: PRIMARY_RED, color: PRIMARY_RED }}><Plus size={16} /> Tambah Produk</button>
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows="2" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-400" placeholder="Catatan tambahan..." />
          </div>

          {/* Total */}
          <div className="border-t pt-4 flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Total</span>
            <span className="text-2xl font-bold" style={{ color: PRIMARY_RED }}>{formatRupiah(formData.total_amount)}</span>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Batal</button>
            <button type="submit" className="px-4 py-2 text-white rounded-lg hover:bg-red-700" style={{ backgroundColor: PRIMARY_RED }}>{initialData ? "Update Transaksi" : "Simpan Transaksi"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// OrderDetailModal
const OrderDetailModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold" style={{ color: PRIMARY_RED }}>Detail Pesanan</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-sm text-gray-500">Order Number</p><p className="font-mono font-semibold">{order.order_number}</p></div>
            <div><p className="text-sm text-gray-500">Tanggal</p><p>{formatDate(order.created_at)}</p></div>
            <div><p className="text-sm text-gray-500">Sumber</p><p className="capitalize">{order.source === "offline" ? "🏪 Toko" : order.source === "gofood" ? "🛵 GoFood" : "🛵 ShopeeFood"}</p></div>
            <div><p className="text-sm text-gray-500">Metode Pembayaran</p><p className="capitalize">{order.payment_method}</p></div>
          </div>
          <div><h3 className="font-semibold text-gray-800 mb-2">🛍️ Produk</h3><div className="space-y-2">{order.items?.map((item) => (<div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"><div><p className="font-medium">{item.product?.name}</p><p className="text-sm text-gray-500">{item.quantity} x {formatRupiah(item.price)}</p></div><p className="font-semibold" style={{ color: PRIMARY_RED }}>{formatRupiah(item.price * item.quantity)}</p></div>))}</div></div>
          <div className="border-t pt-3"><div className="flex justify-between"><span className="font-bold">Total</span><span className="font-bold text-xl" style={{ color: PRIMARY_RED }}>{formatRupiah(order.total_amount)}</span></div></div>
          {order.notes && (<div><p className="text-sm text-gray-500">Catatan</p><p className="text-sm">{order.notes}</p></div>)}
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function ManajemenPenjualanPage() {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const itemsPerPage = 10;

  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      if (response.data.success) {
        setProducts(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/orders`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.data.success) {
        setTransactions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchProducts();
  }, [fetchData, fetchProducts]);

  // Statistik
  const today = new Date().toISOString().split("T")[0];
  const totalPenjualanHariIni = transactions.filter(t => t.created_at?.split("T")[0] === today && t.status === "completed").reduce((sum, t) => sum + t.total_amount, 0);
  const totalBulanIni = transactions.filter(t => { const date = new Date(t.created_at); const now = new Date(); return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear() && t.status === "completed"; }).reduce((sum, t) => sum + t.total_amount, 0);
  const totalKeseluruhan = transactions.filter(t => t.status === "completed").reduce((sum, t) => sum + t.total_amount, 0);

  const filteredTransactions = transactions.filter(t => t.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) || t.payment_method?.toLowerCase().includes(searchTerm.toLowerCase()) || t.source?.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAddTransaction = () => { setEditingTransaction(null); setShowFormModal(true); };
  const handleEditTransaction = (transaction) => { setEditingTransaction(transaction); setShowFormModal(true); };
  const handleDeleteTransaction = async (id, orderNumber) => { if (!window.confirm(`Hapus transaksi ${orderNumber}?`)) return; try { const token = localStorage.getItem("token"); await axios.delete(`${API_URL}/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } }); alert("✅ Transaksi berhasil dihapus!"); fetchData(); } catch (error) { alert("❌ Gagal menghapus transaksi"); } };
  const handleSaveTransaction = async (transactionData) => { try { const token = localStorage.getItem("token"); let response; if (editingTransaction) { response = await axios.put(`${API_URL}/orders/${editingTransaction.id}`, transactionData, { headers: { Authorization: `Bearer ${token}` } }); if (response.data.success) alert("✅ Transaksi berhasil diperbarui!"); } else { response = await axios.post(`${API_URL}/orders`, transactionData, { headers: { Authorization: `Bearer ${token}` } }); if (response.data.success) alert("✅ Transaksi berhasil ditambahkan!"); } if (response.data.success) { fetchData(); setShowFormModal(false); } } catch (error) { alert("❌ Gagal menyimpan transaksi"); } };
  const getSourceIcon = (source) => { switch (source) { case "offline": return "🏪"; case "gofood": return "🛵"; case "shopeefood": return "🛵"; default: return "🏪"; } };
  const getSourceLabel = (source) => { switch (source) { case "offline": return "Toko"; case "gofood": return "GoFood"; case "shopeefood": return "ShopeeFood"; default: return "Toko"; } };

  if (loading) {
    return (<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderBottomColor: PRIMARY_RED }}></div></div>);
  }

  return (
    <>
      <TransactionModal isOpen={showFormModal} onClose={() => setShowFormModal(false)} onSubmit={handleSaveTransaction} initialData={editingTransaction} products={products} />
      <OrderDetailModal order={selectedTransaction} isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} />
      <main className="p-6 md:p-10 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 mb-8 bg-white rounded-xl shadow-lg border-b-4" style={{ borderBottomColor: PRIMARY_RED }}>
          <h2 className="text-3xl font-extrabold" style={{ color: PRIMARY_RED }}>Manajemen Penjualan</h2>
          <button onClick={handleAddTransaction} className="flex items-center gap-2 px-5 py-2.5 text-white rounded-lg hover:bg-red-700 shadow-md" style={{ backgroundColor: PRIMARY_RED }}><Plus size={18} /> Tambah Transaksi</button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4" style={{ borderLeftColor: PRIMARY_RED }}><h3 className="text-sm text-gray-500">Penjualan Hari Ini</h3><p className="text-2xl font-bold" style={{ color: PRIMARY_RED }}>{formatRupiah(totalPenjualanHariIni)}</p></div>
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500"><h3 className="text-sm text-gray-500">Total Bulan Ini</h3><p className="text-2xl font-bold text-blue-600">{formatRupiah(totalBulanIni)}</p></div>
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-green-500"><h3 className="text-sm text-gray-500">Total Keseluruhan</h3><p className="text-2xl font-bold text-green-600">{formatRupiah(totalKeseluruhan)}</p></div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6"><div className="relative w-full md:w-96"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Cari order number, metode, atau sumber..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400" /></div></div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: PRIMARY_RED }}>
                <tr><th className="px-5 py-3 text-left text-sm font-semibold text-white">Order Number</th><th className="px-5 py-3 text-left text-sm font-semibold text-white">Tanggal</th><th className="px-5 py-3 text-left text-sm font-semibold text-white">Sumber</th><th className="px-5 py-3 text-left text-sm font-semibold text-white">Total</th><th className="px-5 py-3 text-left text-sm font-semibold text-white">Metode</th><th className="px-5 py-3 text-left text-sm font-semibold text-white">Status</th><th className="px-5 py-3 text-center text-sm font-semibold text-white">Aksi</th></tr>
              </thead>
              <tbody>
                {paginatedTransactions.length === 0 ? (<tr><td colSpan="7" className="text-center py-12 text-gray-500">Belum ada data penjualan</td></tr>) : (paginatedTransactions.map((tx, idx) => (<tr key={tx.id} className={`border-b hover:bg-red-50 transition ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}><td className="px-5 py-3 font-mono text-sm">{tx.order_number}</td><td className="px-5 py-3 text-sm">{formatDate(tx.created_at)}</td><td className="px-5 py-3"><span className="flex items-center gap-1">{getSourceIcon(tx.source)} {getSourceLabel(tx.source)}</span></td><td className="px-5 py-3 font-semibold" style={{ color: PRIMARY_RED }}>{formatRupiah(tx.total_amount)}</td><td className="px-5 py-3 text-sm capitalize">{tx.payment_method}</td><td className="px-5 py-3"><select value={tx.status} onChange={async (e) => { try { const token = localStorage.getItem("token"); await axios.put(`${API_URL}/orders/${tx.id}`, { status: e.target.value }, { headers: { Authorization: `Bearer ${token}` } }); fetchData(); } catch (error) { alert("Gagal update status"); } }} className={`px-2 py-1 rounded-full text-xs font-semibold ${tx.status === "completed" ? "bg-green-100 text-green-700" : tx.status === "processing" ? "bg-blue-100 text-blue-700" : tx.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"} border-none cursor-pointer`}><option value="pending">Pending</option><option value="processing">Diproses</option><option value="completed">Selesai</option><option value="cancelled">Dibatalkan</option></select></td><td className="px-5 py-3 text-center"><div className="flex justify-center gap-1"><button onClick={() => handleEditTransaction(tx)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit3 size={16} /></button><button onClick={() => handleDeleteTransaction(tx.id, tx.order_number)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button><button onClick={() => { setSelectedTransaction(tx); setShowDetailModal(true); }} className="p-2 text-green-500 hover:bg-green-50 rounded-lg"><Eye size={16} /></button></div></td></tr>)))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (<div className="flex justify-between items-center p-4 border-t bg-gray-50"><span className="text-sm text-gray-600">Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} dari {filteredTransactions.length} transaksi</span><div className="flex gap-2"><button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 rounded-lg border text-sm bg-white disabled:opacity-50">Sebelumnya</button><button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 rounded-lg border text-sm bg-white disabled:opacity-50">Selanjutnya</button></div></div>)}
        </div>
      </main>
    </>
  );
}