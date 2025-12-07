"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

// --- TIPE DATA ---
type TransaksiOffline = {
  id: number;
  nama_pembeli: string;
  nama_kelompok: string;
  jumlah: number;
  total_harga: number;
  metode_pembayaran: string;
  created_at: string;
  // Relasi (Join) dengan jenis_tiket
  jenis_tiket: {
    nama: string;
    harga: number;
  };
};

export default function MenuHistoriOffline() {
  const [data, setData] = useState<TransaksiOffline[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // State Modal Struk
  const [receiptData, setReceiptData] = useState<TransaksiOffline | null>(null);

  // 1️⃣ LOAD DATA
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Select data transaksi + nama tiket dari tabel relasi
      const { data: result, error } = await supabase
        .from("transaksi_kasir")
        .select(`
          *,
          jenis_tiket (nama, harga)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setData(result || []);
    } catch (err: any) {
      toast.error("Gagal memuat data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2️⃣ FITUR GANTI NAMA FILE SAAT CETAK
  useEffect(() => {
    if (receiptData) {
      // Format: Struk-Offline-[ID]-[TGL]
      const tgl = new Date(receiptData.created_at).toLocaleDateString('id-ID').replace(/\//g, '');
      document.title = `Struk-Offline-${receiptData.id}-${tgl}`;
    } else {
      document.title = "Dashboard Kasir"; // Reset judul
    }
  }, [receiptData]);

  // 3️⃣ FILTER PENCARIAN
  const filteredData = data.filter((item) =>
    (item.nama_pembeli || "").toLowerCase().includes(search.toLowerCase()) ||
    (item.nama_kelompok || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-slate-900">
      
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Histori Kasir Offline</h1>
          <p className="text-slate-500 text-sm">Rekap penjualan tiket langsung di lokasi.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input 
            type="text" 
            placeholder="Cari Pembeli..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
      </div>

      {/* Tabel Data */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
            <tr>
              <th className="h-12 px-4 align-middle font-medium">Tanggal</th>
              <th className="h-12 px-4 align-middle font-medium">Pembeli / Kelompok</th>
              <th className="h-12 px-4 align-middle font-medium">Detail Tiket</th>
              <th className="h-12 px-4 align-middle font-medium text-right">Total</th>
              <th className="h-12 px-4 align-middle font-medium text-center">Metode</th>
              <th className="h-12 px-4 align-middle font-medium text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-400">Memuat data...</td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-400">Tidak ada data transaksi.</td></tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 align-middle text-slate-500 whitespace-nowrap">
                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="p-4 align-middle">
                    <div className="font-bold text-slate-900">{item.nama_pembeli || "Umum"}</div>
                    {item.nama_kelompok && item.nama_kelompok !== "-" && (
                        <div className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded w-fit mt-1">
                            {item.nama_kelompok}
                        </div>
                    )}
                  </td>
                  <td className="p-4 align-middle text-slate-600">
                    <span className="font-medium">{item.jenis_tiket?.nama}</span> 
                    <span className="text-slate-400 ml-1">x{item.jumlah}</span>
                  </td>
                  <td className="p-4 align-middle text-right font-bold text-slate-800">
                    Rp {item.total_harga.toLocaleString('id-ID')}
                  </td>
                  <td className="p-4 align-middle text-center">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium border border-slate-200 uppercase">
                        {item.metode_pembayaran}
                    </span>
                  </td>
                  <td className="p-4 align-middle text-center">
                    <button 
                      onClick={() => setReceiptData(item)}
                      className="p-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
                      title="Cetak Ulang Struk"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL CETAK ULANG STRUK --- */}
      {receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 print:p-0 print:bg-white print:items-start print:justify-start">
           
           <div className="bg-white p-6 rounded-lg w-[350px] shadow-2xl relative print:shadow-none print:w-full">
              
              {/* Tampilan Struk */}
              <div id="area-struk" className="font-mono text-sm text-center space-y-2 mb-6 text-black">
                  <h2 className="font-bold text-xl uppercase">Wisata Mangrove</h2>
                  <p className="text-xs">Jl. Raya Mangrove No. 88</p>
                  <p className="text-xs">
                    {new Date(receiptData.created_at).toLocaleDateString('id-ID', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                  
                  <hr className="border-dashed border-gray-400 my-2" />
                  
                  <div className="text-left text-xs">
                      <p>No. Transaksi: OFF-{receiptData.id}</p>
                      <p>Pembeli: {receiptData.nama_pembeli}</p>
                      {receiptData.nama_kelompok && <p>Kelompok: {receiptData.nama_kelompok}</p>}
                  </div>

                  <hr className="border-dashed border-gray-400 my-2" />

                  {/* Item List (Disini karena 1 row = 1 jenis tiket, tampilkan langsung) */}
                  <div className="flex justify-between text-left">
                      <span className="truncate w-32">{receiptData.jenis_tiket?.nama}</span>
                      <span>x{receiptData.jumlah}</span>
                      <span>{receiptData.total_harga.toLocaleString()}</span>
                  </div>

                  <hr className="border-dashed border-gray-400 my-2" />
                  
                  <div className="flex justify-between font-bold text-lg">
                      <span>TOTAL</span>
                      <span>{receiptData.total_harga.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                      <span>Metode</span>
                      <span className="uppercase">{receiptData.metode_pembayaran}</span>
                  </div>
                  
                  <hr className="border-dashed border-gray-400 my-2" />
                  <p className="text-xs mt-4">** COPY RECEIPT **</p>
                  <p className="text-xs">Terima Kasih</p>
              </div>

              {/* Tombol Aksi */}
              <div className="flex gap-3 no-print">
                  <button 
                    onClick={() => setReceiptData(null)}
                    className="flex-1 py-3 border border-slate-300 rounded-lg font-bold hover:bg-slate-50 text-slate-700"
                  >
                    Tutup
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="flex-1 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800"
                  >
                    Cetak
                  </button>
              </div>
           </div>

           {/* CSS Print: Hanya cetak bagian struk */}
           <style jsx global>{`
              @media print {
                body * { visibility: hidden; }
                #area-struk, #area-struk * { visibility: visible; }
                #area-struk { 
                    position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; 
                    font-size: 12px; color: black;
                }
                .no-print { display: none; }
              }
           `}</style>
        </div>
      )}

    </div>
  );
}