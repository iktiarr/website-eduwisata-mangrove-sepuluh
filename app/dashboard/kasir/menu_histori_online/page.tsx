"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useReactToPrint } from "react-to-print";

// --- TIPE DATA ---
type TransaksiOnline = {
  id: number;
  kode_booking: string;
  nama_pembeli: string;
  nomor_hp: string;
  jumlah: number;
  total_harga: number;
  status_pembayaran: string;
  tanggal_berangkat: string;
  created_at: string;
  jenis_tiket: {
    nama: string;
  };
};

export default function MenuHistoriOnline() {
  const [data, setData] = useState<TransaksiOnline[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // State untuk Struk Modal
  const [receiptData, setReceiptData] = useState<TransaksiOnline | null>(null);

  // 1️⃣ LOAD DATA
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Join dengan tabel jenis_tiket untuk ambil namanya
    const { data: result, error } = await supabase
      .from("transaksi_online")
      .select(`
        *,
        jenis_tiket (nama)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Gagal memuat data: " + error.message);
    } else {
      setData(result || []);
    }
    setLoading(false);
  };

  // 2️⃣ VERIFIKASI PEMBAYARAN (Check-in)
  const handleVerify = async (id: number, currentStatus: string) => {
    if (currentStatus === 'sukses') return; // Sudah lunas

    const confirm = window.confirm("Verifikasi pembayaran ini menjadi LUNAS?");
    if (!confirm) return;

    try {
      const { error } = await supabase
        .from("transaksi_online")
        .update({ status_pembayaran: "sukses" })
        .eq("id", id);

      if (error) throw error;

      toast.success("Pembayaran diverifikasi LUNAS");
      fetchData(); // Refresh table

    } catch (err: any) {
      toast.error("Gagal verifikasi: " + err.message);
    }
  };

  // 3️⃣ FILTER SEARCH
  const filteredData = data.filter((item) => 
    item.nama_pembeli?.toLowerCase().includes(search.toLowerCase()) ||
    item.kode_booking?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-slate-900">
      
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Histori Online</h1>
          <p className="text-slate-500 text-sm">Daftar booking yang masuk dari website.</p>
        </div>
        <input 
          type="text" 
          placeholder="Cari Kode / Nama..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      {/* Tabel Data */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
            <tr>
              <th className="h-12 px-4 align-middle font-medium">Tanggal</th>
              <th className="h-12 px-4 align-middle font-medium">Kode Booking</th>
              <th className="h-12 px-4 align-middle font-medium">Nama Pembeli</th>
              <th className="h-12 px-4 align-middle font-medium">Tiket</th>
              <th className="h-12 px-4 align-middle font-medium text-right">Total</th>
              <th className="h-12 px-4 align-middle font-medium text-center">Status</th>
              <th className="h-12 px-4 align-middle font-medium text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-slate-400">Memuat data...</td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-slate-400">Tidak ada data ditemukan.</td></tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 align-middle text-slate-500">
                    {new Date(item.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="p-4 align-middle font-mono font-bold text-slate-700">
                    {item.kode_booking || "-"}
                  </td>
                  <td className="p-4 align-middle">
                    <div className="font-medium text-slate-900">{item.nama_pembeli}</div>
                    <div className="text-xs text-slate-400">{item.nomor_hp}</div>
                  </td>
                  <td className="p-4 align-middle text-slate-600">
                    {item.jenis_tiket?.nama} <span className="text-slate-400">x{item.jumlah}</span>
                  </td>
                  <td className="p-4 align-middle text-right font-medium">
                    Rp {item.total_harga.toLocaleString('id-ID')}
                  </td>
                  <td className="p-4 align-middle text-center">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      item.status_pembayaran === 'sukses' 
                        ? 'bg-green-50 text-green-700 ring-green-600/20' 
                        : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                    }`}>
                      {item.status_pembayaran === 'sukses' ? 'LUNAS' : 'PENDING'}
                    </span>
                  </td>
                  <td className="p-4 align-middle text-center">
                    <div className="flex justify-center gap-2">
                      {/* Tombol Verifikasi (Hanya jika Pending) */}
                      {item.status_pembayaran !== 'sukses' && (
                        <button 
                          onClick={() => handleVerify(item.id, item.status_pembayaran)}
                          className="p-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                          title="Verifikasi Bayar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        </button>
                      )}
                      
                      {/* Tombol Cetak */}
                      <button 
                        onClick={() => setReceiptData(item)}
                        className="p-2 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                        title="Cetak Struk"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL STRUK (RECEIPT) --- */}
      {receiptData && (
        <ReceiptModal 
          data={receiptData} 
          onClose={() => setReceiptData(null)} 
        />
      )}

    </div>
  );
}

// --- KOMPONEN STRUK (Internal) ---
function ReceiptModal({ data, onClose }: { data: TransaksiOnline; onClose: () => void }) {
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 print:p-0 print:bg-white print:items-start print:justify-start">
      
      {/* Container Struk */}
      <div className="bg-white w-full max-w-[300px] p-4 rounded-lg shadow-2xl relative print:shadow-none print:w-full print:max-w-none">
        
        {/* Tombol Close (Disembunyikan saat print) */}
        <button onClick={onClose} className="absolute -top-10 right-0 text-white hover:text-gray-300 print:hidden">
           Tutup [X]
        </button>

        {/* Konten Struk (Thermal Printer Style) */}
        <div className="text-center font-mono text-xs sm:text-sm text-black space-y-2 pb-4">
          
          <div className="mb-4">
            <h2 className="font-bold text-lg uppercase">Wisata Mangrove</h2>
          </div>

          <div className="border-b border-dashed border-black my-2"></div>

          <div className="text-left flex justify-between">
            <span>Tgl:</span>
            <span>{new Date().toLocaleDateString('id-ID')}</span>
          </div>
          <div className="text-left flex justify-between">
            <span>Kode:</span>
            <span className="font-bold">{data.kode_booking}</span>
          </div>
          <div className="text-left">
            <span>A.n: {data.nama_pembeli}</span>
          </div>

          <div className="border-b border-dashed border-black my-2"></div>

          {/* Item List */}
          <div className="text-left">
            <div className="flex justify-between font-bold">
              <span>{data.jenis_tiket?.nama}</span>
            </div>
            <div className="flex justify-between">
              <span>{data.jumlah} x Tiket</span>
              <span>{data.total_harga.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="border-b border-dashed border-black my-2"></div>

          <div className="flex justify-between font-bold text-base">
            <span>TOTAL</span>
            <span>Rp {data.total_harga.toLocaleString('id-ID')}</span>
          </div>

          <div className="flex justify-between text-xs mt-1">
            <span>Status:</span>
            <span>{data.status_pembayaran.toUpperCase()}</span>
          </div>

          <div className="border-b border-dashed border-black my-2"></div>

          <div className="mt-4 text-center">
            <p>Terima Kasih</p>
            <p>Selamat Berwisata</p>
          </div>

        </div>

        {/* Tombol Print (Hidden saat print) */}
        <button 
          onClick={handlePrint}
          className="w-full mt-4 bg-slate-900 text-white py-2 rounded font-bold hover:bg-slate-800 print:hidden"
        >
          🖨️ Cetak Struk
        </button>

      </div>

      {/* CSS Khusus Print: Sembunyikan element lain selain modal */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed, .fixed * {
            visibility: visible;
          }
          .fixed {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: white;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}