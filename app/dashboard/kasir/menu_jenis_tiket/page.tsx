"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

// --- TIPE DATA ---
type JenisTiket = {
  id: number;
  nama: string;
  harga: number;
  status: boolean;
};

export default function MenuJenisTiket() {
  const [tickets, setTickets] = useState<JenisTiket[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State Form
  const [formData, setFormData] = useState({ nama: "", harga: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State Edit Mode
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // State Modal Hapus
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // 1️⃣ LOAD DATA
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("jenis_tiket")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      toast.error("Gagal memuat data tiket");
    } else {
      setTickets(data || []);
    }
    setLoading(false);
  };

  // 2️⃣ HANDLE EDIT CLICK (Isi Form)
  const handleEditClick = (item: JenisTiket) => {
    setFormData({
      nama: item.nama,
      harga: item.harga.toString()
    });
    setEditId(item.id);
    setIsEditing(true);
    
    // Scroll ke atas (opsional, jika di HP)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 3️⃣ BATAL EDIT
  const handleCancelEdit = () => {
    setFormData({ nama: "", harga: "" });
    setIsEditing(false);
    setEditId(null);
  };

  // 4️⃣ SUBMIT (Bisa INSERT atau UPDATE)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.harga) {
        toast.warning("Nama dan harga wajib diisi");
        return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        nama: formData.nama,
        harga: parseInt(formData.harga),
        status: true // Default aktif saat dibuat/diedit
      };

      if (isEditing && editId) {
        // --- LOGIKA UPDATE ---
        const { error } = await supabase
          .from("jenis_tiket")
          .update(payload)
          .eq("id", editId);

        if (error) throw error;
        toast.success("Tiket berhasil diperbarui");
        
      } else {
        // --- LOGIKA INSERT ---
        const { error } = await supabase
          .from("jenis_tiket")
          .insert([payload]);

        if (error) throw error;
        toast.success("Tiket baru ditambahkan");
      }

      // Reset setelah sukses
      fetchTickets();
      handleCancelEdit();

    } catch (err: any) {
      toast.error("Gagal menyimpan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5️⃣ TOGGLE STATUS
  const toggleStatus = async (id: number, currentStatus: boolean) => {
    // Optimistic UI Update
    const originalTickets = [...tickets];
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: !currentStatus } : t));

    try {
      const { error } = await supabase
        .from("jenis_tiket")
        .update({ status: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success(currentStatus ? "Tiket dinonaktifkan" : "Tiket diaktifkan");

    } catch (err) {
      setTickets(originalTickets);
      toast.error("Gagal mengubah status");
    }
  };

  // 6️⃣ HAPUS DATA (Safe Delete)
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase.from("jenis_tiket").delete().eq("id", deleteId);
      
      if (error) {
        if (error.code === '23503') { // Foreign Key Violation
            await supabase.from("jenis_tiket").update({ status: false }).eq("id", deleteId);
            toast.warning("Tiket pernah terjual. Status diubah jadi NON-AKTIF (Arsip).");
        } else {
            throw error;
        }
      } else {
        toast.success("Tiket dihapus permanen");
      }

      fetchTickets();
      setDeleteId(null);
      // Jika yang dihapus sedang diedit, reset form
      if (editId === deleteId) handleCancelEdit();

    } catch (err: any) {
      toast.error("Gagal menghapus: " + err.message);
    }
  };

  return (
    <div className="space-y-8 font-sans text-slate-900">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Jenis Tiket</h1>
        <p className="text-slate-500 text-sm">Kelola daftar tiket wisata mangrove.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* --- KIRI: FORM (Dinamis Tambah/Edit) --- */}
        <div className={`bg-white p-6 rounded-lg border shadow-sm sticky top-4 transition-colors ${isEditing ? 'border-orange-200 ring-1 ring-orange-200' : 'border-slate-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`font-semibold text-sm uppercase tracking-wider ${isEditing ? 'text-orange-600' : 'text-slate-500'}`}>
                {isEditing ? "✏️ Mode Edit" : "➕ Buat Tiket Baru"}
            </h2>
            {isEditing && (
                <button onClick={handleCancelEdit} className="text-xs text-slate-400 hover:text-slate-600 underline">
                    Batal
                </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium leading-none">Nama Tiket</label>
              <input
                type="text"
                placeholder="Misal: Tiket Dewasa"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium leading-none">Harga (Rp)</label>
              <input
                type="number"
                placeholder="0"
                value={formData.harga}
                onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div className="flex gap-2 pt-2">
                {isEditing && (
                    <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="flex-1 rounded-md text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 h-10 px-4 py-2"
                    >
                        Batal
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none h-10 px-4 py-2 text-white disabled:opacity-50 ${
                        isEditing 
                        ? "bg-orange-500 hover:bg-orange-600" 
                        : "bg-slate-900 hover:bg-slate-800"
                    }`}
                >
                    {isSubmitting ? "Menyimpan..." : isEditing ? "Update Tiket" : "Tambah Tiket"}
                </button>
            </div>
          </form>
        </div>

        {/* --- KANAN: TABLE DATA --- */}
        <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="h-12 px-4 align-middle font-medium">Nama Tiket</th>
                <th className="h-12 px-4 align-middle font-medium">Harga</th>
                <th className="h-12 px-4 align-middle font-medium text-center">Status</th>
                <th className="h-12 px-4 align-middle font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-400">Memuat data...</td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-400">Belum ada tiket.</td></tr>
              ) : (
                tickets.map((item) => (
                  <tr key={item.id} className={`transition-colors ${editId === item.id ? 'bg-orange-50' : 'hover:bg-slate-50/50'}`}>
                    <td className="p-4 align-middle font-medium text-slate-900">{item.nama}</td>
                    <td className="p-4 align-middle font-mono text-slate-600">
                      Rp {item.harga.toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 align-middle text-center">
                      <button
                        onClick={() => toggleStatus(item.id, item.status)}
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none cursor-pointer select-none ${
                          item.status 
                            ? "border-transparent bg-slate-900 text-white hover:bg-slate-700" 
                            : "border-slate-200 text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        {item.status ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-2">
                          {/* Tombol Edit */}
                          <button 
                            onClick={() => handleEditClick(item)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-blue-600 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                          </button>
                          {/* Tombol Hapus */}
                          <button 
                            onClick={() => setDeleteId(item.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-600 hover:bg-red-50 transition-colors border border-transparent hover:border-red-200"
                            title="Hapus"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                          </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* --- MODAL DIALOG HAPUS --- */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md gap-4 border p-6 shadow-lg sm:rounded-lg animate-in zoom-in-95">
            <div className="flex flex-col space-y-2 text-center sm:text-left">
              <h3 className="text-lg font-semibold leading-none">Hapus Tiket?</h3>
              <p className="text-sm text-slate-500">
                Jika tiket ini sudah pernah terjual, tiket tidak akan terhapus tapi <strong>dinonaktifkan</strong> demi menjaga data keuangan.
              </p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">
              <button 
                onClick={() => setDeleteId(null)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-100 mt-2 sm:mt-0"
              >
                Batal
              </button>
              <button 
                onClick={handleDeleteConfirm}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-red-600 text-white hover:bg-red-700"
              >
                Hapus / Nonaktifkan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}