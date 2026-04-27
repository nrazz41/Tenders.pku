import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Eye, CheckCircle, Clock, 
  Send, Trash2, Filter, RefreshCw, Star, 
  User
} from 'lucide-react';
import {
  getAllComplaints,
  getComplaintStats,
  updateComplaintStatus,
  respondComplaint,
  deleteComplaint
} from '../../services/api';

const ComplaintsAdmin = () => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showResponseModal, setShowResponseModal] = useState(false);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    read: 'bg-blue-100 text-blue-800',
    responded: 'bg-purple-100 text-purple-800',
    resolved: 'bg-green-100 text-green-800'
  };

  const statusIcons = {
    pending: <Clock size={14} />,
    read: <Eye size={14} />,
    responded: <Send size={14} />,
    resolved: <CheckCircle size={14} />
  };

  const typeLabels = {
    keluhan: '📢 Keluhan',
    saran: '💡 Saran',
    kritik: '👎 Kritik',
    pujian: '👍 Pujian',
    laporkan_gagal_pesan: '⚠️ Gagal Pesan',
    laporkan_pelayanan: '🛎️ Pelayanan',
    laporkan_kualitas_makanan: '🍗 Kualitas Makanan'
  };

  useEffect(() => {
    fetchData();
  }, [filter, typeFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [complaintsRes, statsRes] = await Promise.all([
        getAllComplaints({ 
          status: filter !== 'all' ? filter : undefined, 
          type: typeFilter !== 'all' ? typeFilter : undefined 
        }),
        getComplaintStats()
      ]);
      
      if (complaintsRes.data.success) {
        setComplaints(complaintsRes.data.data.data || complaintsRes.data.data);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateComplaintStatus(id, newStatus);
      fetchData();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleRespond = async (id) => {
    if (!responseText.trim()) {
      alert('Masukkan pesan respon terlebih dahulu');
      return;
    }
    try {
      await respondComplaint(id, responseText);
      setShowResponseModal(false);
      setResponseText('');
      fetchData();
    } catch (error) {
      console.error('Failed to send response:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus pengaduan ini?')) {
      try {
        await deleteComplaint(id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete:', error);
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="text-orange-500" size={28} />
            Manajemen Pengaduan Pelanggan
          </h1>
          <p className="text-gray-500 mt-1">Kelola keluhan, saran, dan masukan dari pelanggan</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
              <div className="text-2xl font-bold text-orange-600">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Pengaduan</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-500">Menunggu Respon</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
              <div className="text-2xl font-bold text-purple-600">{stats.responded || 0}</div>
              <div className="text-sm text-gray-500">Sudah Direspon</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
              <div className="text-2xl font-bold text-green-600">{stats.resolved || 0}</div>
              <div className="text-sm text-gray-500">Selesai</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm font-medium">Filter Status:</span>
            </div>
            {['all', 'pending', 'read', 'responded', 'resolved'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded-full text-sm capitalize transition ${filter === status ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {status === 'all' ? 'Semua' : status}
              </button>
            ))}
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="ml-auto px-3 py-1 border rounded-lg text-sm"
            >
              <option value="all">Semua Tipe</option>
              {Object.entries(typeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <button onClick={fetchData} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* Complaints List */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <MessageSquare size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Belum ada pengaduan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <User size={18} className="text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{complaint.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{typeLabels[complaint.complaint_type]}</span>
                        {complaint.rating > 0 && (
                          <span className="flex items-center gap-1">
                            {Array(complaint.rating).fill().map((_, i) => <Star key={i} size={12} fill="gold" color="gold" />)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${statusColors[complaint.status]}`}>
                      {statusIcons[complaint.status]} {complaint.status}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(complaint.created_at)}</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-3">{complaint.message}</p>

                {complaint.admin_response && (
                  <div className="bg-green-50 rounded-lg p-3 mb-3 text-sm">
                    <strong className="text-green-700">✔ Respon Admin:</strong>
                    <p className="text-gray-600 mt-1">{complaint.admin_response}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t">
                  {complaint.status !== 'resolved' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedComplaint(complaint);
                          setShowResponseModal(true);
                        }}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 flex items-center gap-1"
                      >
                        <Send size={14} /> Respon
                      </button>
                      <button
                        onClick={() => handleStatusChange(complaint.id, 'resolved')}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                      >
                        Tandai Selesai
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(complaint.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Response Modal */}
        {showResponseModal && selectedComplaint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6">
              <h3 className="text-xl font-bold mb-4">Respon Pengaduan</h3>
              <p className="text-sm text-gray-500 mb-2">Dari: {selectedComplaint.name}</p>
              <p className="bg-gray-100 p-3 rounded-lg text-sm mb-4">"{selectedComplaint.message}"</p>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={4}
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Tulis respon Anda di sini..."
              />
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setShowResponseModal(false)} className="px-4 py-2 bg-gray-300 rounded-lg">Batal</button>
                <button onClick={() => handleRespond(selectedComplaint.id)} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">Kirim Respon</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintsAdmin;