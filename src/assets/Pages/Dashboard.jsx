import React, { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { 
  Package, Users, Tag, DollarSign, AlertTriangle, 
  UserPlus, RefreshCcw, LayoutDashboard, TrendingUp, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, ArcElement
);

const PRIMARY_RED = '#B82329';
const DARKER_RED = '#8e1b20';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [chartData, setChartData] = useState({
    monthlySales: Array(12).fill(0),
    membershipDist: {}
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch orders from Supabase
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch users from Supabase
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*');

      if (usersError) throw usersError;

      // Fetch products from Supabase
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) throw productsError;

      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date().getMonth();
      
      const incomeToday = (orders || [])
        .filter(o => o.created_at?.split('T')[0] === today && o.status === 'completed')
        .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

      const incomeMonth = (orders || [])
        .filter(o => {
          const date = new Date(o.created_at);
          return date.getMonth() === thisMonth && o.status === 'completed';
        })
        .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

      const lowStockCount = (products || []).filter(p => p.stock <= 20 && p.stock > 0).length;
      const totalCustomers = (users || []).length;

      setStats([
        { label: "Pendapatan Hari Ini", value: `Rp ${incomeToday.toLocaleString('id-ID')}`, icon: <DollarSign />, path: '/penjualan', color: PRIMARY_RED },
        { label: "Revenue Bulan Ini", value: `Rp ${incomeMonth.toLocaleString('id-ID')}`, icon: <TrendingUp />, path: '/laporan-penjualan', color: DARKER_RED },
        { label: "Stok Kritis", value: `${lowStockCount} Produk`, icon: <AlertTriangle />, path: '/product', color: '#DAA520' },
        { label: "Total Pelanggan", value: `${totalCustomers} Member`, icon: <Users />, path: '/pelanggan', color: '#4A90E2' },
      ]);

      const salesByMonth = Array(12).fill(0);
      (orders || []).forEach(o => {
        if (o.status === 'completed') {
          const month = new Date(o.created_at).getMonth();
          salesByMonth[month] += Number(o.total_amount || 0);
        }
      });

      const memberMap = {};
      (users || []).forEach(u => { 
        const membership = u.membership || 'Classic';
        memberMap[membership] = (memberMap[membership] || 0) + 1; 
      });

      setChartData({ 
        monthlySales: salesByMonth, 
        membershipDist: memberMap 
      });
    } catch (error) {
      console.error("Sinkronisasi gagal:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  const barData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
    datasets: [{
      label: "Revenue (Ribuan)",
      data: chartData.monthlySales.map(v => v / 1000),
      backgroundColor: PRIMARY_RED,
      borderRadius: 5,
    }]
  };

  const doughnutData = {
    labels: Object.keys(chartData.membershipDist),
    datasets: [{
      data: Object.values(chartData.membershipDist),
      backgroundColor: [PRIMARY_RED, '#DAA520', '#94a3b8', '#CD7F32'],
      hoverOffset: 15,
      borderWidth: 0,
    }]
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F4F7FE]">
      <RefreshCcw className="animate-spin mb-4" size={48} style={{ color: PRIMARY_RED }} />
      <p className="font-black uppercase italic tracking-[0.2em] text-gray-400">Tenders Engine Loading...</p>
    </div>
  );

  return (
    <div className="p-6 bg-[#F4F7FE] min-h-screen font-sans text-gray-800">
      {/* Header Eksklusif */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-3" style={{ color: PRIMARY_RED }}>
            <LayoutDashboard size={36} className="text-red-500" /> Dashboard Pusat
          </h1>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.4em] mt-1 ml-1">Live Statistics Monitoring System</p>
        </div>
        <button 
          onClick={fetchData} 
          className="bg-white p-3 rounded-2xl shadow-sm hover:rotate-180 transition-all duration-500 text-gray-400 hover:text-red-500"
        >
          <RefreshCcw size={22} />
        </button>
      </div>

      {/* Grid Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {stats.map((item, idx) => (
          <div 
            key={idx} 
            onClick={() => navigate(item.path)}
            className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 group cursor-pointer hover:shadow-2xl transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                {item.icon}
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
            <h3 className="text-2xl font-black text-gray-900 mb-4">{item.value}</h3>
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter" style={{ color: PRIMARY_RED }}>
                Lihat Detail <ChevronRight size={12} />
            </div>
            <div className="absolute bottom-0 left-0 h-1.5 w-0 group-hover:w-full transition-all duration-500" style={{ backgroundColor: item.color }}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Penjualan - 2/3 Lebar */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
          <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-4">
            <h2 className="text-xl font-black uppercase italic tracking-tighter">Analisis Penjualan Bulanan</h2>
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Target: 100%</span>
          </div>
          <div className="h-72">
             <Bar 
               data={barData} 
               options={{ 
                 responsive: true, 
                 maintainAspectRatio: false,
                 plugins: { legend: { display: false } },
                 scales: { 
                   y: { 
                     beginAtZero: true, 
                     grid: { display: false }, 
                     ticks: { font: { weight: 'bold' } } 
                   }, 
                   x: { 
                     grid: { display: false }, 
                     ticks: { font: { weight: 'bold' } } 
                   } 
                 }
               }} 
             />
          </div>
        </div>

        {/* Doughnut Chart - 1/3 Lebar */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center">
          <h2 className="text-xl font-black uppercase italic tracking-tighter mb-8 border-b border-gray-50 pb-4 w-full text-center">Membership</h2>
          <div className="w-56 h-56 relative">
            <Doughnut 
                data={doughnutData} 
                options={{ 
                    cutout: '75%', 
                    plugins: { legend: { display: false } },
                    maintainAspectRatio: false 
                }} 
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black italic" style={{ color: PRIMARY_RED }}>
                  {Object.values(chartData.membershipDist).reduce((a,b) => a+b, 0)}
                </span>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Total Member</span>
            </div>
          </div>
          <div className="mt-8 w-full space-y-2">
             {Object.entries(chartData.membershipDist).map(([key, val], i) => (
               <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors">
                  <span className="text-[10px] font-black uppercase text-gray-400">{key}</span>
                  <span className="text-sm font-black text-gray-800">{val}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;