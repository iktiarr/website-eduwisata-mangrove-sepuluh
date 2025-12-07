"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend 
} from 'recharts';

// --- TIPE DATA ---
type TransaksiGabungan = {
  id: number;
  total_harga: number;
  jumlah: number;
  created_at: string;
  sumber: 'online' | 'offline';
  jenis_tiket: { nama: string } [];
};

type TicketStat = {
  name: string;
  value: number; // Jumlah tiket
  total: number; // Uang
};

export default function MenuPenghasilan() {
  const [loading, setLoading] = useState(true);
  
  // State Filter
  const [filterType, setFilterType] = useState<'today' | 'yesterday' | 'week' | 'month' | 'custom'>('today');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);

  // Data Statistik
  const [summary, setSummary] = useState({ 
    total: 0, 
    online: 0, 
    offline: 0, 
    visitors: 0, 
    transactions: 0 
  });
  
  const [ticketStats, setTicketStats] = useState<TicketStat[]>([]);
  const [sourceStats, setSourceStats] = useState<{name: string, value: number, color: string}[]>([]);

  // 1️⃣ LOAD DATA
  useEffect(() => {
    fetchReport();
  }, [filterType, customDate]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let startDate = new Date();
      let endDate = new Date();

      // Logika Filter Waktu
      if (filterType === 'custom') {
        startDate = new Date(customDate);
        endDate = new Date(customDate);
      } else if (filterType === 'today') {
        // default hari ini
      } else if (filterType === 'yesterday') {
        startDate.setDate(now.getDate() - 1);
        endDate.setDate(now.getDate() - 1);
      } else if (filterType === 'week') {
        const day = now.getDay() || 7; 
        startDate.setDate(now.getDate() - day + 1);
      } else if (filterType === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      const startISO = startDate.toISOString();
      const endISO = endDate.toISOString();

      // Fetch Data Offline & Online
      const [resOffline, resOnline] = await Promise.all([
        supabase.from("transaksi_kasir")
          .select(`id, total_harga, jumlah, created_at, jenis_tiket(nama)`)
          .gte("created_at", startISO).lte("created_at", endISO),
        
        supabase.from("transaksi_online")
          .select(`id, total_harga, jumlah, created_at, jenis_tiket(nama)`)
          .eq("status_pembayaran", "sukses")
          .gte("created_at", startISO).lte("created_at", endISO)
      ]);

      if (resOffline.error) throw resOffline.error;
      if (resOnline.error) throw resOnline.error;

      // Gabung Data
      const combined = [
        ...(resOffline.data?.map(i => ({ ...i, sumber: 'offline' as const })) || []),
        ...(resOnline.data?.map(i => ({ ...i, sumber: 'online' as const })) || [])
      ];

      calculateStats(combined);

    } catch (err: any) {
      toast.error("Gagal memuat laporan");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: TransaksiGabungan[]) => {
    let totalIncome = 0;
    let onlineIncome = 0;
    let offlineIncome = 0;
    let totalVisitors = 0;
    const tiketMap: Record<string, TicketStat> = {};

    data.forEach(trx => {
      totalIncome += trx.total_harga;
      totalVisitors += trx.jumlah;
      
      if (trx.sumber === 'online') onlineIncome += trx.total_harga;
      else offlineIncome += trx.total_harga;

      const namaTiket = trx.jenis_tiket?.[0]?.nama || "Tiket Terhapus";
      if (!tiketMap[namaTiket]) tiketMap[namaTiket] = { name: namaTiket, value: 0, total: 0 };
      
      tiketMap[namaTiket].value += trx.jumlah;
      tiketMap[namaTiket].total += trx.total_harga;
    });

    setSummary({ total: totalIncome, online: onlineIncome, offline: offlineIncome, visitors: totalVisitors, transactions: data.length });
    setTicketStats(Object.values(tiketMap));
    setSourceStats([
      { name: 'Offline', value: offlineIncome, color: '#16a34a' },
      { name: 'Online', value: onlineIncome, color: '#2563eb' },
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 space-y-8">
      
      {/* HEADER & FILTER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Laporan Penghasilan</h1>
          <p className="text-slate-500 text-sm">Dashboard analitik pendapatan.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          {[{id: 'today', label: 'Hari Ini'}, {id: 'yesterday', label: 'Kemarin'}, {id: 'week', label: 'Minggu Ini'}, {id: 'month', label: 'Bulan Ini'}].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterType(btn.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === btn.id && filterType !== 'custom' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {btn.label}
            </button>
          ))}
          <div className="w-px h-6 bg-slate-200 mx-1"></div>
          <input 
            type="date" 
            className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            value={customDate}
            onChange={(e) => { setCustomDate(e.target.value); setFilterType('custom'); }}
          />
        </div>
      </div>

      {/* CARDS UTAMA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between h-40">
           <div>
             <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Total Pendapatan</p>
             <h3 className="text-3xl font-black mt-1">Rp {summary.total.toLocaleString('id-ID')}</h3>
           </div>
           <div className="flex gap-4 text-xs text-slate-300 font-medium">
             <span>👥 {summary.visitors} Pengunjung</span>
             <span>🧾 {summary.transactions} Transaksi</span>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Offline (Kasir)</p>
           </div>
           <h3 className="text-2xl font-bold text-slate-800">Rp {summary.offline.toLocaleString('id-ID')}</h3>
           <p className="text-xs text-slate-400 mt-1">Tunai di lokasi</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Online (Web)</p>
           </div>
           <h3 className="text-2xl font-bold text-slate-800">Rp {summary.online.toLocaleString('id-ID')}</h3>
           <p className="text-xs text-slate-400 mt-1">Transfer & Booking</p>
        </div>
      </div>

      {/* GRAFIK SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6">Penjualan per Jenis Tiket</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ticketStats} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 11}} interval={0} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px'}} />
                  <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={30}>
                    {ticketStats.map((entry, index) => <Cell key={`cell-${index}`} fill="#334155" />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <h3 className="font-bold text-slate-800 w-full mb-4">Sumber Dana</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={sourceStats} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                    {sourceStats.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
         </div>
      </div>

      {/* TABEL DETAIL */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
           <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Rincian Detail</h3>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-white text-slate-500 font-medium border-b border-slate-100">
            <tr>
              <th className="p-4">Jenis Tiket</th>
              <th className="p-4 text-center">Jumlah Terjual</th>
              <th className="p-4 text-right">Pendapatan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {ticketStats.length === 0 ? (
               <tr><td colSpan={3} className="p-6 text-center text-slate-400">Tidak ada data untuk periode ini.</td></tr>
            ) : (
               ticketStats.map((stat, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{stat.name}</td>
                  <td className="p-4 text-center text-slate-600">{stat.value}</td>
                  <td className="p-4 text-right font-bold text-slate-900">Rp {stat.total.toLocaleString('id-ID')}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="bg-slate-900 text-white font-bold">
             <tr>
               <td className="p-4">TOTAL KESELURUHAN</td>
               <td className="p-4 text-center">{summary.visitors}</td>
               <td className="p-4 text-right">Rp {summary.total.toLocaleString('id-ID')}</td>
             </tr>
          </tfoot>
        </table>
      </div>

    </div>
  );
}