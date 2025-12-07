"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

// --- TIPE DATA ---
type PengumumanType = {
  id: number;
  judul: string;
  isi: string;
  tipe: 'info' | 'penting' | 'promo';
  is_active: boolean;
  created_at: string;
};

export default function MenuPengumuman() {
  // State Data
  const [data, setData] = useState<PengumumanType[]>([]);
  const [loading, setLoading] = useState(true);

  // State Form
  const [formData, setFormData] = useState({
    judul: "",
    isi: "",
    tipe: "info",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Modal Hapus
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // 1️⃣ LOAD DATA
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: result, error } = await supabase
      .from("pengumuman")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Gagal memuat data");
    } else {
      setData(result || []);
    }
    setLoading(false);
  };

  // 2️⃣ SUBMIT (TAMBAH / UPDATE)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul || !formData.isi) {
        toast.warning("Judul dan Isi wajib diisi");
        return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && editId) {
        // Update
        const { error } = await supabase
          .from("pengumuman")
          .update({
            judul: formData.judul,
            isi: formData.isi,
            tipe: formData.tipe
          })
          .eq("id", editId);
        
        if (error) throw error;
        toast.success("Pengumuman diperbarui");
      } else {
        // Insert
        const { error } = await supabase
          .from("pengumuman")
          .insert([{
            judul: formData.judul,
            isi: formData.isi,
            tipe: formData.tipe,
            is_active: true // Default aktif
          }]);
        
        if (error) throw error;
        toast.success("Pengumuman ditambahkan");
      }

      resetForm();
      fetchData();

    } catch (err: any) {
      toast.error("Gagal menyimpan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3️⃣ TOGGLE STATUS (AKTIF/NONAKTIF)
  const toggleStatus = async (id: number, currentStatus: boolean) => {
    // Optimistic Update
    const oldData = [...data];
    setData(prev => prev.map(item => item.id === id ? { ...item, is_active: !currentStatus } : item));

    try {
      const { error } = await supabase
        .from("pengumuman")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success(currentStatus ? "Pengumuman disembunyikan" : "Pengumuman ditayangkan");

    } catch (err) {
      setData(oldData); // Revert jika gagal
      toast.error("Gagal mengubah status");
    }
  };

  // 4️⃣ HAPUS DATA
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from("pengumuman").delete().eq("id", deleteId);
      if (error) throw error;
      
      toast.success("Pengumuman dihapus");
      setDeleteId(null);
      fetchData();
    } catch (err: any) {
      toast.error("Gagal menghapus: " + err.message);
    }
  };

  // Helper Form
  const handleEditClick = (item: PengumumanType) => {
    setFormData({
      judul: item.judul,
      isi: item.isi,
      tipe: item.tipe
    });
    setEditId(item.id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll ke form
  };

  const resetForm = () => {
    setFormData({ judul: "", isi: "", tipe: "info" });
    setIsEditing(false);
    setEditId(null);
  };

  // Helper Badge Color
  const getTypeColor = (tipe: string) => {
    switch (tipe) {
      case 'penting': return "bg-red-100 text-red-700 border-red-200";
      case 'promo': return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="space-y-8 font-sans text-slate-900">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Papan Pengumuman</h1>
        <p className="text-slate-500 text-sm">Kelola informasi yang tampil di dashboard user.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* --- KIRI: FORM INPUT (Sticky) --- */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-4">
          <h2 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
            {isEditing ? "✏️ Edit Pengumuman" : "📢 Buat Pengumuman Baru"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Judul</label>
              <input 
                type="text" 
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 outline-none text-sm"
                placeholder="Contoh: Perbaikan Jalan"
                value={formData.judul}
                onChange={e => setFormData({...formData, judul: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipe</label>
              <select 
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 outline-none text-sm bg-white"
                value={formData.tipe}
                onChange={e => setFormData({...formData, tipe: e.target.value})}
              >
                <option value="info">ℹ️ Info (Biru)</option>
                <option value="penting">⚠️ Penting (Merah)</option>
                <option value="promo">🎉 Promo (Hijau)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Isi Pesan</label>
              <textarea 
                rows={4}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 outline-none text-sm resize-none"
                placeholder="Tulis detail pengumuman..."
                value={formData.isi}
                onChange={e => setFormData({...formData, isi: e.target.value})}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 bg-slate-900 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : isEditing ? "Update" : "Publish"}
              </button>
              {isEditing && (
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-200"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* --- KANAN: LIST DATA --- */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="text-center py-10 text-slate-400">Memuat data...</div>
          ) : data.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
              Belum ada pengumuman.
            </div>
          ) : (
            data.map((item) => (
              <div 
                key={item.id} 
                className={`bg-white p-5 rounded-xl border shadow-sm transition-all hover:shadow-md ${!item.is_active ? 'border-slate-200 opacity-60 bg-slate-50' : 'border-slate-200'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2 items-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getTypeColor(item.tipe)}`}>
                      {item.tipe}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  
                  {/* Status Toggle Badge */}
                  <button 
                    onClick={() => toggleStatus(item.id, item.is_active)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-full border transition-colors ${
                      item.is_active 
                      ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" 
                      : "bg-slate-200 text-slate-500 border-slate-300 hover:bg-slate-300"
                    }`}
                  >
                    {item.is_active ? "● TAYANG" : "○ ARSIP"}
                  </button>
                </div>

                <h3 className="font-bold text-slate-800 text-lg mb-1">{item.judul}</h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {item.isi}
                </p>

                {/* Actions Footer */}
                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => handleEditClick(item)}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => setDeleteId(item.id)}
                    className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded transition-colors"
                  >
                    🗑️ Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* --- MODAL HAPUS --- */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Pengumuman?</h3>
              <p className="text-slate-500 text-sm mb-6">Data yang dihapus tidak dapat dikembalikan.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 text-sm">Batal</button>
                <button onClick={handleDeleteConfirm} className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg text-sm">Hapus</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}