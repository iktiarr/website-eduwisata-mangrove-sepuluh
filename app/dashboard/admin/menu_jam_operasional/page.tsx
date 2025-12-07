"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

// --- TIPE DATA ---
type Jadwal = {
  id: number;
  nama_hari: string;
  jam_buka: string;
  jam_tutup: string;
  keterangan: 'buka' | 'tutup' | 'dipesan';
};

export default function MenuWaktuOperasional() {
  const [data, setData] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);

  // State Modal Edit
  const [editingItem, setEditingItem] = useState<Jadwal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1️⃣ LOAD DATA
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: result, error } = await supabase
      .from("waktu_operasional")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      toast.error("Gagal memuat jadwal");
    } else {
      setData(result || []);
    }
    setLoading(false);
  };

  // 2️⃣ SUBMIT UPDATE
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("waktu_operasional")
        .update({
          jam_buka: editingItem.jam_buka,
          jam_tutup: editingItem.jam_tutup,
          keterangan: editingItem.keterangan
        })
        .eq("id", editingItem.id);

      if (error) throw error;

      toast.success(`Jadwal ${editingItem.nama_hari} berhasil disimpan`);
      setEditingItem(null);
      fetchData(); 

    } catch (err: any) {
      toast.error("Gagal update: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Jam Operasional</h1>
          <p className="text-slate-500 text-sm">Atur jadwal operasional mingguan.</p>
        </div>
      </div>

      {/* --- LIST JADWAL (TABEL MODERN) --- */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
            <tr>
              <th className="h-12 px-6 align-middle font-semibold w-32">Hari</th>
              <th className="h-12 px-6 align-middle font-semibold text-center w-32">Status</th>
              <th className="h-12 px-6 align-middle font-semibold text-center">Jam Buka</th>
              <th className="h-12 px-6 align-middle font-semibold text-center">Jam Tutup</th>
              <th className="h-12 px-6 align-middle font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400">Memuat jadwal...</td></tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 px-6 align-middle font-bold text-slate-800">
                    {item.nama_hari}
                  </td>
                  
                  <td className="p-4 align-middle text-center">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border capitalize ${
                      item.keterangan === 'buka' ? "bg-green-50 text-green-700 border-green-200" :
                      item.keterangan === 'tutup' ? "bg-red-50 text-red-700 border-red-200" :
                      "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }`}>
                      {item.keterangan}
                    </span>
                  </td>

                  <td className="p-4 align-middle text-center font-mono text-slate-600">
                    {item.keterangan === 'tutup' ? '-' : item.jam_buka.slice(0, 5)}
                  </td>
                  
                  <td className="p-4 align-middle text-center font-mono text-slate-600">
                    {item.keterangan === 'tutup' ? '-' : item.jam_tutup.slice(0, 5)}
                  </td>

                  <td className="p-4 px-6 align-middle text-right">
                    <button 
                      onClick={() => setEditingItem(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL EDIT (POP UP) --- */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
              <h2 className="font-bold text-base">Ubah Jadwal {editingItem.nama_hari}</h2>
              <button onClick={() => setEditingItem(null)} className="hover:text-slate-300">✕</button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {['buka', 'tutup', 'dipesan'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setEditingItem({...editingItem, keterangan: status as any})}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all capitalize ${
                        editingItem.keterangan === status 
                          ? "bg-slate-900 text-white border-slate-900" 
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {editingItem.keterangan !== 'tutup' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Buka</label>
                    <input 
                      type="time" 
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm font-mono"
                      value={editingItem.jam_buka}
                      onChange={(e) => setEditingItem({...editingItem, jam_buka: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tutup</label>
                    <input 
                      type="time" 
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm font-mono"
                      value={editingItem.jam_tutup}
                      onChange={(e) => setEditingItem({...editingItem, jam_tutup: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-slate-800 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}