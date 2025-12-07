"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

// --- TIPE DATA ---
type JenisTiket = {
  id: number;
  nama: string;
  harga: number;
};

type CartItem = {
  id: number;
  nama: string;
  harga: number;
  qty: number;
};

type TransaksiSelesai = {
  id_transaksi: number[];
  total: number;
  bayar: number;
  kembalian: number;
  items: CartItem[];
  tanggal: string;
  kasir: string;
};

export default function MenuKasir() {
  // Data Master
  const [tickets, setTickets] = useState<JenisTiket[]>([]);
  
  // Data Transaksi
  const [cart, setCart] = useState<CartItem[]>([]);
  const [namaPembeli, setNamaPembeli] = useState("Kasir"); 
  const [namaKelompok, setNamaKelompok] = useState("");
  const [uangDiterima, setUangDiterima] = useState(""); 
  
  // State UI
  const [processing, setProcessing] = useState(false); // Kunci tombol saat proses
  const [receipt, setReceipt] = useState<TransaksiSelesai | null>(null); // Data struk sukses
  
  // Refs
  const uangInputRef = useRef<HTMLInputElement>(null);

  // 1️⃣ LOAD TIKET
  useEffect(() => {
    const fetchTickets = async () => {
      const { data } = await supabase.from("jenis_tiket").select("*").eq("status", true).order("id");
      if (data) setTickets(data);
    };
    fetchTickets();
  }, []);

  // 2️⃣ AUTO PRINT SAAT TRANSAKSI SUKSES
  useEffect(() => {
    if (receipt) {
      // Ubah Judul untuk Nama File
      const now = new Date();
      const timeStr = now.getHours() + "" + now.getMinutes() + "" + now.getSeconds();
      document.title = `Struk-${receipt.id_transaksi[0]}-${timeStr}`;
      
      // Auto Print dengan Delay sedikiiit biar rendering selesai
      const timer = setTimeout(() => {
        window.print();
      }, 500);

      return () => clearTimeout(timer);
    } else {
      document.title = "Kasir Mangrove"; 
    }
  }, [receipt]);

  // 3️⃣ SHORTCUT KEYBOARD
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        // Jika struk muncul, Enter = Tutup & Transaksi Baru
        if (receipt) {
          e.preventDefault();
          handleReset();
          return;
        }
        // Jika di input uang, Enter = Bayar
        if (document.activeElement === uangInputRef.current) {
           handleCheckout();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, uangDiterima, receipt, namaPembeli, processing]);

  // LOGIKA KERANJANG
  const addToCart = (ticket: JenisTiket) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === ticket.id);
      if (exists) {
        return prev.map((item) => item.id === ticket.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...ticket, qty: 1 }];
    });
    // Auto fokus ke input uang
    setTimeout(() => uangInputRef.current?.focus(), 100);
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) => prev.map((item) => {
        if (item.id === id) return { ...item, qty: Math.max(1, item.qty + delta) };
        return item;
      })
    );
  };

  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // HITUNGAN
  const totalTagihan = cart.reduce((acc, item) => acc + item.harga * item.qty, 0);
  const bayar = parseInt(uangDiterima || "0");
  const kembalian = bayar - totalTagihan;

  // 4️⃣ PROSES BAYAR (ANTI DOUBLE)
  const handleCheckout = async () => {
    // Validasi Ketat
    if (processing) return; // Stop jika sedang proses (Klik ganda tertahan disini)
    if (cart.length === 0) return toast.warning("Keranjang kosong!");
    if (!namaPembeli) return toast.warning("Isi nama pembeli!");
    if (kembalian < 0) return toast.error("Uang kurang!");

    setProcessing(true); // Kunci tombol segera!

    try {
      const transaksiPayload = cart.map((item) => ({
        kasir_id: null, 
        nama_pembeli: namaPembeli,
        nama_kelompok: namaKelompok || "-",
        jenis_tiket_id: item.id,
        jumlah: item.qty,
        tanggal_berangkat: new Date().toISOString().split("T")[0],
        total_harga: item.harga * item.qty,
        metode_pembayaran: 'tunai',
      }));

      const { data, error } = await supabase
        .from("transaksi_kasir")
        .insert(transaksiPayload)
        .select("id");

      if (error) throw error;

      // KUNCI SUKSES:
      // 1. Simpan data struk ke state 'receipt' (untuk diprint)
      // 2. KOSONGKAN KERANJANG SEGERA agar tidak bisa disubmit lagi
      setReceipt({
        id_transaksi: data.map(d => d.id),
        total: totalTagihan,
        bayar: bayar,
        kembalian: kembalian,
        items: [...cart], // Copy item sebelum dihapus
        tanggal: new Date().toLocaleDateString('id-ID'),
        kasir: namaPembeli
      });

      setCart([]); // Hapus keranjang
      setUangDiterima(""); 

    } catch (err: any) {
      toast.error("Gagal: " + err.message);
      setProcessing(false); // Buka kunci jika error
    }
    // Note: setProcessing(false) TIDAK dipanggil disini jika sukses,
    // biarkan tetap true agar tombol bayar mati sampai user klik "Tutup"
  };

  // 5️⃣ RESET SETELAH SELESAI
  const handleReset = () => {
    setReceipt(null);
    setProcessing(false); // Baru buka kunci disini
    setNamaPembeli("Kasir");
    setNamaKelompok("");
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-6 font-sans text-slate-900">
      
      {/* === KIRI: KATALOG TIKET === */}
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-lg text-slate-800">Pilih Tiket</h2>
        </div>
        <div className="p-4 overflow-y-auto grid grid-cols-2 gap-4 content-start">
          {tickets.map((t) => (
            <button
              key={t.id}
              onClick={() => addToCart(t)}
              disabled={processing} // Disable saat proses bayar/cetak
              className="flex flex-col justify-center items-center p-6 h-32 rounded-xl border-2 border-slate-100 bg-white hover:border-green-600 hover:bg-green-50 transition-all active:scale-95 shadow-sm group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-bold text-xl text-slate-700 group-hover:text-green-800 mb-1 text-center">{t.nama}</span>
              <span className="font-mono font-bold text-lg text-green-600 bg-green-100 px-3 py-1 rounded">Rp {t.harga.toLocaleString("id-ID")}</span>
            </button>
          ))}
        </div>
      </div>

      {/* === KANAN: FORM KASIR === */}
      <div className="w-full lg:w-[450px] flex flex-col bg-white rounded-xl border border-slate-200 shadow-xl">
        <div className="p-5 bg-slate-900 text-white rounded-t-xl space-y-3">
          <div className="grid grid-cols-3 gap-3">
             <div className="col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Pembeli</label>
                <input 
                    type="text" 
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:border-green-500 focus:outline-none font-medium"
                    value={namaPembeli}
                    onChange={e => setNamaPembeli(e.target.value)}
                    disabled={processing}
                />
             </div>
             <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Kelompok</label>
                <input 
                    type="text" 
                    placeholder="-"
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:border-green-500 focus:outline-none"
                    value={namaKelompok}
                    onChange={e => setNamaKelompok(e.target.value)}
                    disabled={processing}
                />
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
              <p className="text-xl font-bold">Keranjang Kosong</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">{item.nama}</p>
                  <p className="text-xs text-slate-500">Rp {item.harga.toLocaleString()} / tiket</p>
                </div>
                <div className="flex items-center gap-1">
                   <button disabled={processing} onClick={() => updateQty(item.id, -1)} className="w-8 h-8 rounded bg-slate-100 hover:bg-red-100 text-slate-600 font-bold">-</button>
                   <span className="w-8 text-center font-bold">{item.qty}</span>
                   <button disabled={processing} onClick={() => updateQty(item.id, 1)} className="w-8 h-8 rounded bg-slate-100 hover:bg-green-100 text-slate-600 font-bold">+</button>
                   <button disabled={processing} onClick={() => removeItem(item.id)} className="ml-2 text-slate-300 hover:text-red-500">🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-slate-200 bg-white shadow-lg z-10">
          <div className="flex justify-between items-end mb-4">
            <span className="text-gray-500 font-bold">Total</span>
            <span className="text-4xl font-black text-slate-900">{totalTagihan.toLocaleString("id-ID")}</span>
          </div>
          <div className="space-y-4">
             <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">Rp</span>
                <input 
                  ref={uangInputRef}
                  type="number" 
                  placeholder="0" 
                  className="w-full pl-12 pr-4 py-4 text-3xl font-bold border-2 border-slate-300 rounded-xl focus:border-green-600 focus:ring-0 outline-none text-right bg-slate-50 disabled:bg-slate-100"
                  value={uangDiterima}
                  onChange={(e) => setUangDiterima(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCheckout(); }}
                  disabled={processing}
                />
             </div>
             <div className="flex justify-between items-center px-2">
                <span className="text-sm font-bold text-slate-500">Kembalian</span>
                <span className={`text-xl font-bold ${kembalian < 0 ? 'text-red-500' : 'text-blue-600'}`}>Rp {kembalian.toLocaleString("id-ID")}</span>
             </div>
             
             {/* Tombol Bayar Berubah Status */}
             <button 
                onClick={handleCheckout}
                disabled={processing || cart.length === 0}
                className={`w-full h-16 rounded-xl font-bold text-2xl shadow-lg transition-all flex justify-center items-center gap-3 ${
                    processing 
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed" 
                    : "bg-green-600 text-white hover:bg-green-700 active:scale-95"
                }`}
             >
                {processing ? "Sedang Mencetak..." : "BAYAR (Enter) 🖨️"}
             </button>
          </div>
        </div>
      </div>

      {/* === MODAL SUKSES (TAMPILAN SEDERHANA) === */}
      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           
           {/* Box Struk (Tampil di Layar) */}
           <div className="bg-white p-8 rounded-2xl w-[400px] shadow-2xl text-center space-y-6 relative print:hidden">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-2">
                ✅
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Transaksi Sukses!</h2>
                <p className="text-slate-500 mt-1">Struk sedang dicetak otomatis...</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left space-y-2">
                 <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{receipt.total.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span>Kembali</span>
                    <span>{receipt.kembalian.toLocaleString()}</span>
                 </div>
              </div>

              <button 
                onClick={handleReset}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 shadow-lg focus:ring-4 focus:ring-slate-300 transition-all"
              >
                Tutup / Transaksi Baru
              </button>
           </div>

           {/* --- BAGIAN INI HANYA MUNCUL SAAT PRINT (STRUK THERMAL) --- */}
           <div id="area-struk" className="hidden print:block font-mono text-sm text-center space-y-2 text-black w-full">
              <h2 className="font-bold text-xl uppercase">Wisata Mangrove</h2>
              <p className="text-xs">Jl. Raya Mangrove No. 88</p>
              <p className="text-xs">{receipt.tanggal}</p>
              <hr className="border-dashed border-black my-2" />
              <div className="text-left">
                  <p>Kasir: {receipt.kasir}</p>
                  <p>Pelanggan: {namaPembeli}</p>
              </div>
              <hr className="border-dashed border-black my-2" />
              {receipt.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-left">
                      <span className="truncate w-32">{item.nama}</span>
                      <span>x{item.qty}</span>
                      <span>{item.harga * item.qty}</span>
                  </div>
              ))}
              <hr className="border-dashed border-black my-2" />
              <div className="flex justify-between font-bold text-lg">
                  <span>TOTAL</span>
                  <span>{receipt.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                  <span>Bayar</span>
                  <span>{receipt.bayar.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                  <span>Kembali</span>
                  <span>{receipt.kembalian.toLocaleString()}</span>
              </div>
              <hr className="border-dashed border-black my-2" />
              <p className="text-xs mt-4">Terima Kasih</p>
           </div>

           {/* CSS PRINT */}
           <style jsx global>{`
              @media print {
                body * { visibility: hidden; }
                #area-struk, #area-struk * { visibility: visible; }
                #area-struk { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; font-size: 12px; color: black; }
              }
           `}</style>
        </div>
      )}

    </div>
  );
}