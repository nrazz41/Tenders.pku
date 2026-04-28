import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import { 
  TrendingUp, Package, RefreshCcw, Download, FileText, Users 
} from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import * as XLSX from 'xlsx';

const PRIMARY_RED = '#B82329';

const SalesReportsPage = () => {
  const [salesData, setSalesData] = useState([]);
  const [orderRawData, setOrderRawData] = useState([]);
  const [customerRawData, setCustomerRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportSummary, setReportSummary] = useState({
    totalSales: 0,
    totalTransactions: 0,
    totalCustomers: 0,
    topProduct: '-',
  });

const fetchDataReport = useCallback(async () => {
  setLoading(true);
  try {
    // Fetch orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;

    // Fetch order_items dengan products
    const orderIds = orders?.map(o => o.id) || [];
    
    let orderItems = [];
    if (orderIds.length > 0) {
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*, products(*)')
        .in('order_id', orderIds);

      if (itemsError) throw itemsError;
      orderItems = items || [];
    }

    // Gabungkan data
    const ordersWithItems = (orders || []).map(order => ({
      ...order,
      order_items: orderItems.filter(item => item.order_id === order.id)
    }));

    // Fetch customers
    const { data: customers, error: customersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (customersError) throw customersError;

    setOrderRawData(ordersWithItems);
    setCustomerRawData(customers || []);

    // Proses data untuk laporan
    const monthlyMap = {};
    let totalRevenue = 0;
    let productCount = {};

    const completedOrders = ordersWithItems.filter(o => o.status === 'completed');

    completedOrders.forEach(order => {
      const date = new Date(order.created_at);
      const monthName = date.toLocaleString('id-ID', { month: 'short' });
      
      if (!monthlyMap[monthName]) {
        monthlyMap[monthName] = { name: monthName, Penjualan: 0, Transaksi: 0 };
      }
      
      const orderTotal = Number(order.total_amount || 0);
      monthlyMap[monthName].Penjualan += orderTotal;
      monthlyMap[monthName].Transaksi += 1;
      totalRevenue += orderTotal;

      if (order.order_items) {
        order.order_items.forEach(item => {
          const productName = item.products?.name || 'Produk';
          productCount[productName] = (productCount[productName] || 0) + (item.quantity || 0);
        });
      }
    });
    
    const topProduct = Object.keys(productCount).length > 0 
      ? Object.keys(productCount).reduce((a, b) => productCount[a] > productCount[b] ? a : b)
      : '-';

    setSalesData(Object.values(monthlyMap));
    setReportSummary({
      totalSales: totalRevenue,
      totalTransactions: completedOrders.length,
      totalCustomers: customers?.length || 0,
      topProduct: topProduct,
    });
  } catch (error) {
    console.error("Gagal sinkronisasi laporan:", error);
    alert("Gagal memuat data laporan: " + error.message);
  } finally {
    setLoading(false);
  }
}, []);
  useEffect(() => {
    fetchDataReport();
  }, [fetchDataReport]);

  // --- FUNGSI EKSPOR EXCEL (.xlsx) ---
  const handleExportExcel = () => {
    if (orderRawData.length === 0) return alert("Data masih kosong!");

    const wb = XLSX.utils.book_new();

    // Sheet 1: Ringkasan Bisnis
    const summaryWS = XLSX.utils.aoa_to_sheet([
      ["LAPORAN RINGKASAN TENDERS PKU", ""],
      ["Tanggal Cetak:", new Date().toLocaleDateString('id-ID')],
      ["", ""],
      ["METRIK", "NILAI"],
      ["Total Pendapatan", `Rp ${reportSummary.totalSales.toLocaleString('id-ID')}`],
      ["Pesanan Selesai", `${reportSummary.totalTransactions} Transaksi`],
      ["Total Member", `${reportSummary.totalCustomers} Orang`],
      ["Produk Terlaris", reportSummary.topProduct]
    ]);

    // Sheet 2: Detail Penjualan
    const salesWS = XLSX.utils.json_to_sheet(orderRawData.map(o => ({
      "No. Order": o.order_number,
      "Tanggal": new Date(o.created_at).toLocaleDateString('id-ID'),
      "Pelanggan": o.customer_name || 'Guest',
      "Total (Rp)": o.total_amount,
      "Metode": o.payment_method,
      "Sumber": o.source,
      "Status": o.status
    })));

    // Sheet 3: Data Pelanggan
    const customerWS = XLSX.utils.json_to_sheet(customerRawData.map(c => ({
      "ID Member": `TDR-${String(c.id).slice(-4)}`,
      "Nama Lengkap": c.full_name || c.email,
      "Email": c.email,
      "No. HP": c.phone || '-',
      "Tier": c.membership || 'Classic'
    })));

    XLSX.utils.book_append_sheet(wb, summaryWS, "Ringkasan");
    XLSX.utils.book_append_sheet(wb, salesWS, "Data Penjualan");
    XLSX.utils.book_append_sheet(wb, customerWS, "Data Pelanggan");

    XLSX.writeFile(wb, `Laporan_TendersPKU_${new Date().getTime()}.xlsx`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#F4F7FE]">
        <RefreshCcw className="animate-spin mb-4" size={48} style={{ color: PRIMARY_RED }} />
        <p className="font-black uppercase italic tracking-widest text-gray-400">Sinkronisasi Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE] p-6 font-sans text-gray-800">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: PRIMARY_RED }}>Laporan Bisnis</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Live Analytics Tenders.pku</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchDataReport} 
            className="bg-white p-2.5 rounded-lg shadow-sm border border-gray-100 text-gray-500 hover:text-red-500 transition-all"
          >
            <RefreshCcw size={20} />
          </button>
          <button 
            onClick={handleExportExcel}
            className="text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-black transition-all shadow-md"
            style={{ backgroundColor: PRIMARY_RED }}
          >
            <Download size={18} /> Ekspor Excel
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Pendapatan" value={`Rp ${reportSummary.totalSales.toLocaleString('id-ID')}`} />
        <StatCard title="Pesanan Selesai" value={`${reportSummary.totalTransactions} Order`} isRed={true} />
        <StatCard title="Total Member" value={`${reportSummary.totalCustomers} Orang`} />
        <StatCard title="Produk Terlaris" value={reportSummary.topProduct} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center gap-2 mb-6 border-b pb-4">
            <TrendingUp size={20} style={{ color: PRIMARY_RED }} />
            <h2 className="text-lg font-black uppercase italic tracking-tighter">Tren Penjualan</h2>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} />
                <YAxis tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickFormatter={(v) => `Rp${v/1000}k`} />
                <Tooltip />
                <Line type="monotone" dataKey="Penjualan" stroke={PRIMARY_RED} strokeWidth={4} dot={{ r: 6, fill: PRIMARY_RED }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center gap-2 mb-6 border-b pb-4">
            <Package size={20} style={{ color: PRIMARY_RED }} />
            <h2 className="text-lg font-black uppercase italic tracking-tighter">Volume Transaksi</h2>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} />
                <YAxis tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} />
                <Tooltip />
                <Bar dataKey="Transaksi" fill={PRIMARY_RED} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl" style={{ backgroundColor: `${PRIMARY_RED}20`, color: PRIMARY_RED }}>
            <FileText size={24} />
          </div>
          <div>
            <h4 className="font-black text-gray-800 uppercase italic">Sinkronisasi Database</h4>
            <p className="text-sm text-gray-500 font-medium tracking-tight">Menampilkan integrasi data real-time dari tabel Penjualan dan Pelanggan.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, isRed }) => (
  <div className={`${isRed ? 'text-white' : 'bg-white text-gray-800 border border-gray-100'} p-6 rounded-xl shadow-sm transition-transform hover:scale-[1.02]`} style={isRed ? { backgroundColor: PRIMARY_RED } : {}}>
    <p className={`${isRed ? 'text-red-100' : 'text-gray-400'} text-[10px] font-black uppercase tracking-widest`}>{title}</p>
    <h3 className="text-2xl font-bold mt-1 truncate">{value}</h3>
  </div>
);

export default SalesReportsPage;