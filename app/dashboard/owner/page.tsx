"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

// --- TIPE DATA ---
type SummaryStats = {
  totalRevenue: number;
  onlineRevenue: number;
  offlineRevenue: number;
  totalTrx: number;
  totalUsers: number;
  avgRating: string;
  totalReview: number;
};

type TransaksiGabungan = {
  id: string;
  sumber: 'Online' | 'Offline';
  pembeli: string;
  detail: string;
  tiket: string;
  jumlah: number;
  total: number;
  status: string;
  tanggal: string;
};

type OperationalData = {
  jadwal: any[];
  pengumuman: any[];
  tiket: any[];
  maintenance: boolean;
};

export default function OwnerDashboardFull() {
  const [loading, setLoading] = useState(true);
  
  // State Data
  const [stats, setStats] = useState<SummaryStats>({
    totalRevenue: 0, onlineRevenue: 0, offlineRevenue: 0, 
    totalTrx: 0, totalUsers: 0, avgRating: "0", totalReview: 0
  });
  const [transactions, setTransactions] = useState<TransaksiGabungan[]>([]);
  const [opsData, setOpsData] = useState<OperationalData>({ jadwal: [], pengumuman: [], tiket: [], maintenance: false });

  // 1️⃣ LOAD SEMUA DATA
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // A. KEUANGAN & TRANSAKSI
        const { data: offline } = await supabase.from("transaksi_kasir")
          .select(`*, jenis_tiket(nama)`).order('created_at', { ascending: false });
        
        const { data: online } = await supabase.from("transaksi_online")
          .select(`*, jenis_tiket(nama)`).eq("status_pembayaran", "sukses").order('created_at', { ascending: false });

        // B. USER & ULASAN
        const { count: userCount } = await supabase.from("users").select("*", { count: 'exact', head: true });
        const { data: reviews } = await supabase.from("ulasan").select("rating");

        // C. OPERASIONAL
        const { data: jadwal } = await supabase.from("waktu_operasional").select("*").order("id");
        const { data: pengumuman } = await supabase.from("pengumuman").select("*").eq("is_active", true);
        const { data: listTiket } = await supabase.from("jenis_tiket").select("*").eq("status", true);
        const { data: settings } = await supabase.from("app_settings").select("*").eq("setting_key", "maintenance_mode").single();

        // --- PENGOLAHAN DATA ---
        
        const revOffline = offline?.reduce((sum, item) => sum + item.total_harga, 0) || 0;
        const revOnline = online?.reduce((sum, item) => sum + item.total_harga, 0) || 0;
        const totalRating = reviews?.reduce((sum, item) => sum + item.rating, 0) || 0;
        const avg = reviews?.length ? (totalRating / reviews.length).toFixed(1) : "0";

        setStats({
          totalRevenue: revOffline + revOnline,
          onlineRevenue: revOnline,
          offlineRevenue: revOffline,
          totalTrx: (offline?.length || 0) + (online?.length || 0),
          totalUsers: userCount || 0,
          avgRating: avg,
          totalReview: reviews?.length || 0
        });

        setOpsData({
          jadwal: jadwal || [],
          pengumuman: pengumuman || [],
          tiket: listTiket || [],
          maintenance: settings?.is_enabled || false
        });

        // Gabung Transaksi untuk Tabel
        const mergedTrx: TransaksiGabungan[] = [
          ...(offline?.map(i => ({
            id: `OFF-${i.id}`,
            sumber: 'Offline' as const,
            pembeli: i.nama_pembeli || 'Umum',
            detail: i.nama_kelompok || '-',
            tiket: i.jenis_tiket?.nama || 'Unknown',
            jumlah: i.jumlah,
            total: i.total_harga,
            status: 'LUNAS',
            tanggal: i.created_at
          })) || []),
          ...(online?.map(i => ({
            id: `ON-${i.id}`,
            sumber: 'Online' as const,
            pembeli: i.nama_pembeli,
            detail: i.nomor_hp || '-',
            tiket: i.jenis_tiket?.nama || 'Unknown',
            jumlah: i.jumlah,
            total: i.total_harga,
            status: 'LUNAS',
            tanggal: i.created_at
          })) || [])
        ].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

        setTransactions(mergedTrx);

      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat data dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Memuat Data Owner...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* === HEADER === */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-bold uppercase mb-2">
              Privilege: Owner (Read Only)
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Pusat Kendali Bisnis</h1>
            <p className="text-slate-500">Monitoring seluruh aktivitas Eduwisata Mangrove secara real-time.</p>
          </div>
        </div>

        {/* === DIV 1: RINGKASAN KEUANGAN (BIG NUMBERS) === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between h-40 relative overflow-hidden">
             <div className="relative z-10">
               <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Omset</p>
               <h3 className="text-3xl font-black mt-2">Rp {stats.totalRevenue.toLocaleString('id-ID')}</h3>
             </div>
             <div className="relative z-10 flex gap-2 text-xs">
                <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded border border-green-500/30">Offline: {(stats.offlineRevenue/stats.totalRevenue*100 || 0).toFixed(0)}%</span>
                <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded border border-blue-500/30">Online: {(stats.onlineRevenue/stats.totalRevenue*100 || 0).toFixed(0)}%</span>
             </div>
             <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          {/* Transaksi Count */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
             <div>
               <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Total Transaksi</p>
               <h3 className="text-3xl font-black text-slate-800 mt-2">{stats.totalTrx} <span className="text-lg font-medium text-slate-400">Nota</span></h3>
             </div>
             <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full" style={{width: '100%'}}></div>
             </div>
          </div>

          {/* User Stats */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
             <div>
               <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">User Terdaftar</p>
               <h3 className="text-3xl font-black text-slate-800 mt-2">{stats.totalUsers} <span className="text-lg font-medium text-slate-400">Akun</span></h3>
             </div>
             <div className="flex items-center gap-2 text-xs text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                Data dari tabel public.users
             </div>
          </div>

          {/* Review Stats */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
             <div>
               <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Kepuasan User</p>
               <div className="flex items-center gap-2 mt-2">
                  <h3 className="text-3xl font-black text-slate-800">{stats.avgRating}</h3>
                  <div className="text-yellow-500 text-xl">⭐⭐⭐⭐</div>
               </div>
             </div>
             <p className="text-xs text-slate-400 mt-2">Dari {stats.totalReview} ulasan masuk</p>
          </div>
        </div>

        {/* === DIV 2: INFO OPERASIONAL (JADWAL & STATUS) === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           {/* Jadwal Operasional */}
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                🕒 Jadwal Operasional Saat Ini
              </h3>
              <div className="space-y-3">
                 {opsData.jadwal.map((j) => (
                    <div key={j.id} className="flex justify-between text-sm border-b border-slate-50 last:border-0 pb-2">
                       <span className="font-medium text-slate-600 w-24">{j.nama_hari}</span>
                       {j.keterangan === 'tutup' ? (
                          <span className="text-red-500 font-bold text-xs uppercase">Tutup</span>
                       ) : (
                          <span className="text-slate-800 font-mono">{j.jam_buka.slice(0,5)} - {j.jam_tutup.slice(0,5)}</span>
                       )}
                    </div>
                 ))}
              </div>
           </div>

           {/* Status Website & Harga Tiket */}
           <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Status Web */}
              <div className={`p-6 rounded-2xl border flex flex-col justify-center items-center text-center ${opsData.maintenance ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
                 <div className={`p-4 rounded-full mb-3 ${opsData.maintenance ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                 </div>
                 <h4 className={`font-bold text-lg ${opsData.maintenance ? 'text-orange-800' : 'text-green-800'}`}>
                    {opsData.maintenance ? "WEBSITE MODE PERBAIKAN" : "WEBSITE AKTIF (ONLINE)"}
                 </h4>
                 <p className="text-sm opacity-80 mt-1">
                    {opsData.maintenance ? "User tidak bisa akses (Terkunci)" : "User bisa akses & booking normal"}
                 </p>
              </div>

              {/* Harga Tiket */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                 <h3 className="font-bold text-slate-800 mb-4">🎫 Harga Tiket Berlaku</h3>
                 <div className="space-y-3">
                    {opsData.tiket.length === 0 ? <p className="text-slate-400 text-sm">Tidak ada tiket aktif</p> : 
                       opsData.tiket.map((t) => (
                          <div key={t.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                             <span className="font-medium text-slate-700">{t.nama}</span>
                             <span className="font-bold text-slate-900">Rp {t.harga.toLocaleString('id-ID')}</span>
                          </div>
                       ))
                    }
                 </div>
              </div>

           </div>
        </div>

        {/* === DIV 3: DATA TRANSAKSI LENGKAP (TABEL) === */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                 <h3 className="font-bold text-slate-800 text-lg">Semua Transaksi Masuk</h3>
                 <p className="text-xs text-slate-500">Gabungan data dari Kasir Offline dan Website Online</p>
              </div>
              <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                 {transactions.length} Data
              </span>
           </div>
           
           <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-sm text-left">
                 <thead className="bg-white text-slate-500 font-medium border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                    <tr>
                       <th className="p-4 w-32">Tanggal</th>
                       <th className="p-4">Sumber</th>
                       <th className="p-4">Pembeli</th>
                       <th className="p-4">Info/Kontak</th>
                       <th className="p-4">Jenis Tiket</th>
                       <th className="p-4 text-center">Jml</th>
                       <th className="p-4 text-right">Total (Rp)</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {transactions.length === 0 ? (
                       <tr><td colSpan={7} className="p-8 text-center text-slate-400">Belum ada data transaksi.</td></tr>
                    ) : (
                       transactions.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                             <td className="p-4 whitespace-nowrap text-slate-500">
                                {new Date(row.tanggal).toLocaleDateString('id-ID')} <br/>
                                <span className="text-xs opacity-70">{new Date(row.tanggal).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</span>
                             </td>
                             <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${row.sumber === 'Online' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                   {row.sumber}
                                </span>
                             </td>
                             <td className="p-4 font-bold text-slate-800">{row.pembeli}</td>
                             <td className="p-4 text-slate-500 text-xs font-mono">{row.detail}</td>
                             <td className="p-4 text-slate-700">{row.tiket}</td>
                             <td className="p-4 text-center font-medium">{row.jumlah}</td>
                             <td className="p-4 text-right font-bold text-slate-900">
                                {row.total.toLocaleString('id-ID')}
                             </td>
                          </tr>
                       ))
                    )}
                 </tbody>
              </table>
           </div>
        </div>

      </div>
    </div>
  );
}