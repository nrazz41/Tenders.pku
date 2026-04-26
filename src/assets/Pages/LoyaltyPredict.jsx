import React, { useState } from "react";
import { 
  BrainCircuit, BarChart3, RefreshCcw, 
  Target, Zap, Activity, ShieldCheck, Info
} from "lucide-react";

export default function LoyaltyPredict() {
  const [membership, setMembership] = useState("0");
  const [status, setStatus] = useState("1");
  const [transaksi, setTransaksi] = useState("");
  const [lamaBergabung, setLamaBergabung] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const primaryRed = '#B82329';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        " https://a3f3-2001-448a-1090-c050-d4c3-d93e-84b8-f9f4.ngrok-free.app/predict",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            membership_encoded: parseInt(membership),
            status_encoded: parseInt(status),
            total_transaksi: parseFloat(transaksi),
            lama_bergabung: parseInt(lamaBergabung),
          }),
        }
      );

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: "Gagal terhubung ke Server AI Tenders." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] p-6 font-sans text-gray-800">
      {/* Header - Konsisten dengan Tenders Style */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#B82329]">AI Loyalty Predictor</h1>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">Prediksi Loyalitas Berbasis Machine Learning</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase text-gray-500">AI Server Online</span>
        </div>
      </div>

      {/* Stat Cards - Konsisten dengan halaman sebelumnya */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 text-[#B82329] rounded-lg"><Target /></div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400">Akurasi Model</p>
            <h3 className="text-2xl font-bold">98.5%</h3>
          </div>
        </div>
        <div className="bg-[#B82329] p-6 rounded-xl shadow-md text-white flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg"><Zap /></div>
          <div>
            <p className="text-[10px] font-black uppercase text-red-100">Status Engine</p>
            <h3 className="text-2xl font-bold text-white">Fast Response</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Activity /></div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400">Metode</p>
            <h3 className="text-2xl font-bold text-gray-800">Random Forest</h3>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Form Prediction - Konsisten dengan Modal/Table Style */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 w-full lg:w-1/2">
          <div className="flex items-center gap-2 mb-6 border-b pb-4">
            <BrainCircuit className="text-[#B82329]" />
            <h2 className="text-lg font-black uppercase italic tracking-tighter">Input Data Pelanggan</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Membership Aktif</label>
              <select
                value={membership}
                onChange={(e) => setMembership(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold text-sm transition-all"
                required
              >
                <option value="0">Classic Member</option>
                <option value="1">Silver Member</option>
                <option value="2">Gold Member</option>
                <option value="3">Platinum Member</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Status Keaktifan</label>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold text-sm"
                >
                    <option value="1">Aktif</option>
                    <option value="0">Tidak Aktif</option>
                </select>
                </div>
                <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Lama Gabung (Bulan)</label>
                <input
                    type="number"
                    value={lamaBergabung}
                    onChange={(e) => setLamaBergabung(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold text-sm"
                    placeholder="0"
                    required
                />
                </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Total Belanja (IDR)</label>
              <input
                type="number"
                value={transaksi}
                onChange={(e) => setTransaksi(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold text-sm"
                placeholder="Misal: 350000"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#B82329] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <RefreshCcw className="animate-spin" /> : <BarChart3 size={20} />}
              {loading ? "PROCESSING..." : "RUN AI PREDICTION"}
            </button>
          </form>
        </div>

        {/* Prediction Result Display */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 h-full flex flex-col justify-center items-center text-center">
                {!result && !loading && (
                    <div className="text-gray-300">
                        <Info size={60} className="mx-auto mb-4 opacity-20" />
                        <p className="font-bold uppercase text-xs tracking-widest italic">Silakan input data untuk melihat hasil prediksi</p>
                    </div>
                )}

                {loading && (
                    <div className="text-[#B82329] animate-pulse">
                        <RefreshCcw size={60} className="mx-auto mb-4 animate-spin" />
                        <p className="font-black uppercase text-sm italic">AI sedang menganalisis pola transaksi...</p>
                    </div>
                )}

                {result && result.label_nama && (
                    <div className="animate-in fade-in zoom-in duration-500">
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] mb-4">Hasil Prediksi Loyalitas</p>
                        
                        <div className={`text-6xl font-black uppercase italic tracking-tighter mb-4 ${
                            result.label_nama === "Gold" || result.label_nama === "Platinum" ? "text-green-600" : "text-orange-500"
                        }`}>
                            {result.label_nama}
                        </div>

                        <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 inline-block w-full max-w-sm">
                            <h4 className="font-black text-gray-800 uppercase italic mb-2">Analisis Sistem:</h4>
                            <p className="text-sm font-bold text-gray-600 leading-relaxed">
                                Berdasarkan data transaksi senilai <span className="text-[#B82329]">Rp {Number(transaksi).toLocaleString()}</span>, 
                                sistem memprediksi pelanggan ini <span className="underline underline-offset-4 decoration-[#B82329]">
                                    {result.label_nama === "Gold" || result.label_nama === "Platinum" ? "SANGAT LOYAL" : "BELUM LOYAL"}
                                </span> terhadap brand Tenders.pku.
                            </p>
                        </div>
                        
                        <div className="mt-8">
                             <span className="px-4 py-2 bg-black text-white rounded-full text-[10px] font-black tracking-widest uppercase">
                                Confidence Level: 98%
                             </span>
                        </div>
                    </div>
                )}

                {result && result.error && (
                    <div className="text-red-500 font-black italic">
                        {result.error}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}