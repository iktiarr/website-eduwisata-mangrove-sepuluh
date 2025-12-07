"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import MaintenanceGuard from "../MaintenanceGuard";

type JenisTiket = {
  id: number;
  nama: string;
  harga: number;
  status: boolean;
};

type TransaksiHistory = {
  id: number;
  nama_pembeli: string;
  jumlah: number;
  total_harga: number;
  tanggal_berangkat: string;
  status_pembayaran: string;
  created_at: string;
  jenis_tiket: {
    nama: string;
  };
};

type TicketResult = {
  booking_code: string;
  nama_pembeli: string;
  total_harga: number;
  jumlah: number;
  tanggal_berangkat: string;
  detail_tiket: string[];
};

export default function PesanTiketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successTicket, setSuccessTicket] = useState<TicketResult | null>(null);
  const [listTiket, setListTiket] = useState<JenisTiket[]>([]);
  const [history, setHistory] = useState<TransaksiHistory[]>([]);
  const [selectedHarga, setSelectedHarga] = useState(0);
  const [form, setForm] = useState({
    nama_pembeli: "",
    jenis_tiket_id: "",
    jumlah: 1,
    tanggal_kunjungan: "",
  });

  useEffect(() => {
    const userSession = localStorage.getItem("user");
    let currentUser = "";

    if (userSession) {
      const user = JSON.parse(userSession);
      currentUser = user.nama_lengkap || user.name || "";
      setForm((prev) => ({ ...prev, nama_pembeli: currentUser }));
    } else {
        router.replace("/login");
    }

    const fetchTiket = async () => {
      const { data } = await supabase.from("jenis_tiket").select("*").eq("status", true);
      if (data) setListTiket(data);
    };

    fetchTiket();
    fetchHistory(currentUser);
  }, [router]);

  const fetchHistory = async (namaUser: string) => {
    if (!namaUser) return;
    const { data, error } = await supabase
      .from("transaksi_online")
      .select(`
        *,
        jenis_tiket (nama)
      `)
      .eq("nama_pembeli", namaUser)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Gagal ambil history:", error.message);
    } else {
      setHistory(data);
    }
  };

  const handleTiketChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tiketId = e.target.value;
    const tiket = listTiket.find((t) => t.id.toString() === tiketId);
    
    setForm({ ...form, jenis_tiket_id: tiketId });
    setSelectedHarga(tiket ? tiket.harga : 0);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!form.nama_pembeli || !form.jenis_tiket_id || !form.tanggal_kunjungan) {
      alert("Mohon lengkapi data!");
      setLoading(false);
      return;
    }

    const tiketDipilih = listTiket.find((t) => t.id.toString() === form.jenis_tiket_id);
    if (!tiketDipilih) return;

    const totalBayar = tiketDipilih.harga * form.jumlah;
    const ticketIdInt = parseInt(form.jenis_tiket_id);

    try {
      const payloadTransaksi = {
        nama_pembeli: form.nama_pembeli,
        jenis_tiket_id: ticketIdInt,
        jumlah: form.jumlah,
        tanggal_berangkat: form.tanggal_kunjungan,
        total_harga: totalBayar,
        status_pembayaran: "pending"
      };

      const { data: trxData, error: trxError } = await supabase
        .from("transaksi_online")
        .insert([payloadTransaksi])
        .select()
        .single();

      if (trxError) throw trxError;

      const ticketsToInsert = [];
      const generatedCodes = [];

      for (let i = 0; i < form.jumlah; i++) {
        const kodeUnik = `TKT-${Date.now().toString().slice(-5)}-${Math.floor(Math.random() * 1000)}-${i+1}`;
        generatedCodes.push(kodeUnik);

        ticketsToInsert.push({
          kode: kodeUnik,
          jenis_tiket_id: ticketIdInt,
          nama_pemilik: form.nama_pembeli,
          tanggal_berangkat: form.tanggal_kunjungan,
          status: 'aktif',
        });
      }

      const { error: tiketError } = await supabase
        .from("tiket")
        .insert(ticketsToInsert);

      if (tiketError) throw tiketError;

      setSuccessTicket({
        booking_code: generatedCodes[0],
        nama_pembeli: form.nama_pembeli,
        total_harga: totalBayar,
        jumlah: form.jumlah,
        tanggal_berangkat: form.tanggal_kunjungan,
        detail_tiket: generatedCodes
      });

      fetchHistory(form.nama_pembeli);

    } catch (err: any) {
      console.error("Gagal pesan:", err);
      alert("Gagal menyimpan data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(num);
  };

  if (successTicket) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
          <div className="bg-green-600 p-6 text-center text-white">
            <h2 className="text-2xl font-bold uppercase tracking-widest">Pemesanan Berhasil!</h2>
            <p className="text-green-100 text-sm">Silakan tunjukkan kode berikut</p>
          </div>
          
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="text-center mb-6">
               <p className="text-sm text-gray-500 mb-1">Total Pembayaran</p>
               <p className="text-2xl font-bold text-green-600">{formatRupiah(successTicket.total_harga)}</p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-700 border-b pb-2">Daftar Tiket Anda ({successTicket.jumlah})</p>
              {successTicket.detail_tiket.map((kode, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300 flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Tiket #{idx + 1}</span>
                  <span className="font-mono font-bold text-gray-800 tracking-wider">{kode}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-gray-50 flex gap-3 border-t">
             <button onClick={() => window.print()} className="flex-1 bg-white border border-gray-300 py-3 rounded-xl font-bold hover:bg-gray-100">Cetak</button>
             <button onClick={() => setSuccessTicket(null)} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700">Tutup</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
            <button onClick={() => router.back()} className="p-2 rounded-full bg-white hover:bg-gray-100 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Pemesanan Tiket Mangrove</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 sticky top-4">
            <div className="bg-green-600 p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                🎟️ Form Pemesanan Tiket
              </h2>
            </div>

            <form onSubmit={onSubmit} className="p-6 space-y-5">
              <div>
                <label className="text-sm font-bold text-gray-700">Nama Pemesan</label>
                <input
                  type="text"
                  value={form.nama_pembeli}
                  onChange={(e) => setForm({ ...form, nama_pembeli: e.target.value })}
                  className="w-full p-3 mt-1 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="Nama lengkap..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-bold text-gray-700">Tanggal Pesanan</label>
                    <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]} 
                    onChange={(e) => setForm({ ...form, tanggal_kunjungan: e.target.value })}
                    className="w-full p-3 mt-1 border border-gray-300 rounded-xl outline-none"
                    required
                    />
                </div>
                 <div>
                    <label className="text-sm font-bold text-gray-700">Jumlah Orang</label>
                    <input
                        type="number"
                        min="1"
                        value={form.jumlah}
                        onChange={(e) => setForm({...form, jumlah: parseInt(e.target.value)})}
                        className="w-full p-3 mt-1 border border-gray-300 rounded-xl outline-none"
                    />
                </div>
              </div>

               <div>
                  <label className="text-sm font-bold text-gray-700">Jenis Tiket</label>
                  <select
                  onChange={handleTiketChange}
                  defaultValue=""
                  className="w-full p-3 mt-1 border border-gray-300 rounded-xl bg-white outline-none"
                  required
                  >
                  <option value="" disabled>-- Pilih Tiket --</option>
                  {listTiket.map((tiket) => (
                      <option key={tiket.id} value={tiket.id}>
                      {tiket.nama} - {formatRupiah(tiket.harga)}
                      </option>
                  ))}
                  </select>
              </div>

              <div className="bg-green-50 p-4 rounded-xl flex justify-between items-center border border-green-100">
                <span className="text-gray-600 font-medium">Total Bayar</span>
                <span className="text-xl font-bold text-green-700">
                    {formatRupiah(selectedHarga * form.jumlah)}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition-all ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 hover:shadow-lg"
                }`}
              >
                {loading ? "Memproses..." : "Pesan Tiket Sekarang"}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
              🕒 Riwayat Pesanan Anda
            </h2>
            
            {history.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-300 text-center text-gray-400">
                    Belum ada riwayat pesanan.
                </div>
            ) : (
                <div className="space-y-4 h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                    {history.map((item) => (
                        <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-xl ${
                                item.status_pembayaran === 'sukses' ? 'bg-green-100 text-green-700' : 
                                item.status_pembayaran === 'cancel' ? 'bg-red-100 text-red-700' : 
                                'bg-yellow-100 text-yellow-700'
                            }`}>
                                {item.status_pembayaran ? item.status_pembayaran.toUpperCase() : 'PENDING'}
                            </div>

                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">
                                      {item.jenis_tiket?.nama || "Tiket dihapus"}
                                    </h3>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                      📅 Berangkat: {item.tanggal_berangkat}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-end border-t border-gray-100 pt-3 mt-2">
                                <div>
                                    <p className="text-xs text-gray-500">Jumlah</p>
                                    <p className="font-semibold text-gray-800">{item.jumlah} Orang</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Total Harga</p>
                                    <p className="font-bold text-green-600 text-lg">{formatRupiah(item.total_harga)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}