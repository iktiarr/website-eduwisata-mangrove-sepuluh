"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

// --- TIPE DATA ---
type UlasanType = {
  id: number;
  nama_pengirim: string;
  rating: number;
  komentar: string;
  is_anonymous: boolean;
  created_at: string;
};

export default function MenuUlasan() {
  const [reviews, setReviews] = useState<UlasanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // State Modal Hapus
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // 1️⃣ LOAD DATA
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ulasan")
      .select("*")
      .order("created_at", { ascending: false }); // Terbaru di atas

    if (error) {
      toast.error("Gagal memuat ulasan");
    } else {
      setReviews(data || []);
    }
    setLoading(false);
  };

  // 2️⃣ HAPUS ULASAN
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase.from("ulasan").delete().eq("id", deleteId);
      if (error) throw error;

      toast.success("Ulasan berhasil dihapus");
      setReviews(prev => prev.filter(r => r.id !== deleteId)); // Optimistic update
      setDeleteId(null); // Tutup modal

    } catch (err: any) {
      toast.error("Gagal menghapus: " + err.message);
    }
  };

  // 3️⃣ RENDER BINTANG
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}`}
        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ));
  };

  // Filter Search
  const filteredReviews = reviews.filter(r => 
    r.nama_pengirim.toLowerCase().includes(search.toLowerCase()) ||
    r.komentar.toLowerCase().includes(search.toLowerCase())
  );

  // Statistik Sederhana
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) 
    : "0.0";

  return (
    <div className="space-y-8 font-sans text-slate-900">
      
      {/* HEADER PAGE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Ulasan Pengunjung</h1>
          <p className="text-slate-500 text-sm">Moderasi ulasan dan feedback dari user.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input 
            type="text" 
            placeholder="Cari nama atau isi komentar..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all"
          />
        </div>
      </div>

      {/* STATISTIK RINGKAS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
           <p className="text-xs font-bold text-slate-400 uppercase">Total Ulasan</p>
           <p className="text-2xl font-bold text-slate-900">{reviews.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
           <p className="text-xs font-bold text-slate-400 uppercase">Rata-rata Rating</p>
           <div className="flex items-center gap-2">
             <p className="text-2xl font-bold text-yellow-500">{avgRating}</p>
             <span className="text-sm text-slate-400">/ 5.0</span>
           </div>
        </div>
      </div>

      {/* LIST ULASAN (GRID CARD) */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Memuat ulasan...</div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
          Tidak ada ulasan ditemukan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              
              {/* Header Card */}
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${item.is_anonymous ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-600'}`}>
                      {item.nama_pengirim.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{item.nama_pengirim}</h4>
                      <p className="text-xs text-slate-400">
                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  {item.is_anonymous && (
                    <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-1 rounded-full border border-slate-200">Anon</span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-3">
                  {renderStars(item.rating)}
                </div>

                {/* Komentar */}
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  "{item.komentar}"
                </p>
              </div>

              {/* Footer Card (Delete Action) */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setDeleteId(item.id)}
                  className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Hapus Ulasan
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* --- MODAL KONFIRMASI HAPUS --- */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                ⚠️
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Ulasan Ini?</h3>
              <p className="text-slate-500 text-sm mb-6">
                Ulasan yang dihapus tidak dapat dikembalikan. Pastikan ini adalah spam atau melanggar aturan.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
                >
                  Batal
                </button>
                <button 
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200 text-sm"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}