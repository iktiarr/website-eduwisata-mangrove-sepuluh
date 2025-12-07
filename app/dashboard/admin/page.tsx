"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

// --- TIPE DATA ---
type DashboardStats = {
  maintenance: boolean;
  revenueToday: number;     // Gabungan Online + Offline
  trxToday: number;         // Jumlah transaksi hari ini
  chatUnread: number;       // Chat dari user
  reviewsToday: number;
  usersNew: number;
  activeAnnouncements: number;
};

type RecentActivity = {
  id: string | number;
  type: "chat" | "review" | "user" | "order";
  message: string;
  time: string;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    maintenance: false,
    revenueToday: 0,
    trxToday: 0,
    chatUnread: 0,
    reviewsToday: 0,
    usersNew: 0,
    activeAnnouncements: 0,
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      // 1. DATA SISTEM & PENGUMUMAN
      const { data: settings } = await supabase.from("app_settings").select("is_enabled").eq("setting_key", "maintenance_mode").single();
      const { count: annCount } = await supabase.from("pengumuman").select("*", { count: "exact", head: true }).eq("is_active", true);

      // 2. DATA KEUANGAN (KASIR + ONLINE)
      // a. Offline (Kasir)
      const { data: offlineTrx } = await supabase
        .from("transaksi_kasir")
        .select("total_harga, created_at")
        .gte("created_at", todayISO);
      
      // b. Online (Web - Sukses)
      const { data: onlineTrx } = await supabase
        .from("transaksi_online")
        .select("total_harga, created_at")
        .eq("status_pembayaran", "sukses")
        .gte("created_at", todayISO);

      const totalOffline = offlineTrx?.reduce((sum, item) => sum + item.total_harga, 0) || 0;
      const totalOnline = onlineTrx?.reduce((sum, item) => sum + item.total_harga, 0) || 0;
      const totalTrxCount = (offlineTrx?.length || 0) + (onlineTrx?.length || 0);

      // 3. DATA INTERAKSI (CHAT, REVIEW, USER)
      const { count: chatCount } = await supabase.from("chat_messages").select("*", { count: "exact", head: true }).eq("sender_role", "user").gte("created_at", todayISO);
      const { count: reviewCount } = await supabase.from("ulasan").select("*", { count: "exact", head: true }).gte("created_at", todayISO);
      const { count: userCount } = await supabase.from("users").select("*", { count: "exact", head: true }).gte("created_at", todayISO);

      // 4. RECENT ACTIVITY (Gabungan)
      const activityList: RecentActivity[] = [];

      // Ambil sedikit data untuk timeline
      const { data: recentReview } = await supabase.from("ulasan").select("id, nama_pengirim, rating, created_at").order("created_at", { ascending: false }).limit(2);
      const { data: recentUser } = await supabase.from("users").select("id, name, created_at").order("created_at", { ascending: false }).limit(2);
      const { data: recentTrx } = await supabase.from("transaksi_kasir").select("id, total_harga, created_at").order("created_at", { ascending: false }).limit(2);

      recentReview?.forEach(r => activityList.push({ id: `rev-${r.id}`, type: "review", message: `Ulasan baru dari ${r.nama_pengirim} (${r.rating}⭐)`, time: r.created_at }));
      recentUser?.forEach(u => activityList.push({ id: `usr-${u.id}`, type: "user", message: `User baru mendaftar: ${u.name}`, time: u.created_at }));
      recentTrx?.forEach(t => activityList.push({ id: `trx-${t.id}`, type: "order", message: `Transaksi Kasir: Rp ${t.total_harga.toLocaleString()}`, time: t.created_at }));

      activityList.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      setStats({
        maintenance: settings?.is_enabled || false,
        revenueToday: totalOffline + totalOnline,
        trxToday: totalTrxCount,
        chatUnread: chatCount || 0,
        reviewsToday: reviewCount || 0,
        usersNew: userCount || 0,
        activeAnnouncements: annCount || 0,
      });
      setActivities(activityList.slice(0, 5));

    } catch (err) {
      console.error("Gagal load dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-400">Memuat dashboard...</div>;

  return (
    <div className="space-y-8 font-sans text-slate-900 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Dashboard Admin</h1>
          <p className="text-slate-500 text-sm">Pusat kontrol dan monitoring aktivitas wisata.</p>
        </div>
        <div className="px-4 py-2 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 border border-slate-200">
          📅 {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* --- SECTION 1: KEUANGAN (KONEKSI KASIR) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Pendapatan */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between">
           <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Omset Hari Ini (Gabungan)</p>
              <h2 className="text-4xl font-extrabold">Rp {stats.revenueToday.toLocaleString('id-ID')}</h2>
              <div className="mt-3 flex gap-2">
                 <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded border border-green-500/30">Kasir Offline</span>
                 <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-500/30">Web Online</span>
              </div>
           </div>
           <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center text-3xl">💰</div>
        </div>

        {/* Card Transaksi */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Transaksi Hari Ini</p>
              <h2 className="text-4xl font-extrabold text-slate-800">{stats.trxToday}</h2>
              <p className="text-xs text-slate-400 mt-2">Tiket terjual via Loket & Web</p>
           </div>
           <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl">🧾</div>
        </div>
      </div>

      {/* --- SECTION 2: OPERASIONAL (Maintenance, Pengumuman, Jam) --- */}
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-8">Operasional & Sistem</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Maintenance */}
        <Link href="/dashboard/admin/menu_pengaturan" className="group">
          <div className={`h-full p-5 rounded-xl border transition-all hover:shadow-md ${stats.maintenance ? "bg-orange-50 border-orange-200" : "bg-white border-slate-200"}`}>
            <div className="flex justify-between items-center mb-3">
               <span className={`text-xs font-bold px-2 py-1 rounded ${stats.maintenance ? "bg-orange-200 text-orange-800" : "bg-green-100 text-green-700"}`}>
                 {stats.maintenance ? "MAINTENANCE ON" : "WEBSITE AKTIF"}
               </span>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 group-hover:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <h4 className="font-bold text-slate-800">Status Website</h4>
            <p className="text-xs text-slate-500 mt-1">Klik untuk ubah status.</p>
          </div>
        </Link>

        {/* 2. Pengumuman */}
        <Link href="/dashboard/admin/menu_pengumuman" className="group">
          <div className="h-full p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
            <div className="flex justify-between items-center mb-3">
               <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">📢</div>
               <span className="text-2xl font-bold text-slate-800">{stats.activeAnnouncements}</span>
            </div>
            <h4 className="font-bold text-slate-800">Pengumuman Aktif</h4>
            <p className="text-xs text-slate-500 mt-1">Info yang tayang di user.</p>
          </div>
        </Link>

        {/* 3. Jam Operasional */}
        <Link href="/dashboard/admin/menu_waktu_operasional" className="group">
          <div className="h-full p-5 bg-white rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all">
            <div className="flex justify-between items-center mb-3">
               <div className="h-8 w-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">🕒</div>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
            <h4 className="font-bold text-slate-800">Jam Operasional</h4>
            <p className="text-xs text-slate-500 mt-1">Atur jadwal buka/tutup.</p>
          </div>
        </Link>

      </div>

      {/* --- SECTION 3: AKTIVITAS USER --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Statistik User */}
        <div className="space-y-6">
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Interaksi</h3>
           
           <Link href="/dashboard/admin/menu_booking" className="block p-5 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all">
              <div className="flex justify-between items-center">
                 <div className="flex gap-4 items-center">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">💬</div>
                    <div>
                       <h4 className="font-bold text-slate-800">Pesan Chat</h4>
                       <p className="text-xs text-slate-500">Masuk hari ini</p>
                    </div>
                 </div>
                 <span className="text-2xl font-bold text-slate-800">{stats.chatUnread}</span>
              </div>
           </Link>

           <Link href="/dashboard/admin/menu_ulasan" className="block p-5 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all">
              <div className="flex justify-between items-center">
                 <div className="flex gap-4 items-center">
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">⭐</div>
                    <div>
                       <h4 className="font-bold text-slate-800">Ulasan Baru</h4>
                       <p className="text-xs text-slate-500">Masuk hari ini</p>
                    </div>
                 </div>
                 <span className="text-2xl font-bold text-slate-800">{stats.reviewsToday}</span>
              </div>
           </Link>

           <Link href="/dashboard/admin/menu_user" className="block p-5 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all">
              <div className="flex justify-between items-center">
                 <div className="flex gap-4 items-center">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">👤</div>
                    <div>
                       <h4 className="font-bold text-slate-800">User Baru</h4>
                       <p className="text-xs text-slate-500">Mendaftar hari ini</p>
                    </div>
                 </div>
                 <span className="text-2xl font-bold text-slate-800">+{stats.usersNew}</span>
              </div>
           </Link>
        </div>

        {/* Kolom Kanan: Timeline Aktivitas */}
        <div className="lg:col-span-2">
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Aktivitas Terbaru</h3>
           <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100">
                 {activities.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">Belum ada aktivitas hari ini.</div>
                 ) : (
                    activities.map((item) => (
                       <div key={item.id} className="p-4 flex gap-4 items-start hover:bg-slate-50 transition-colors">
                          <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                             item.type === 'order' ? 'bg-green-500' : 
                             item.type === 'chat' ? 'bg-blue-500' : 
                             item.type === 'review' ? 'bg-yellow-500' : 'bg-purple-500'
                          }`}></div>
                          <div>
                             <p className="text-sm font-medium text-slate-800">{item.message}</p>
                             <p className="text-xs text-slate-400 mt-1">
                                {new Date(item.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • 
                                <span className="uppercase ml-1 font-bold text-[10px]">{item.type}</span>
                             </p>
                          </div>
                       </div>
                    ))
                 )}
              </div>
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                 <span className="text-xs text-slate-400 font-medium">Menampilkan 5 aktivitas terakhir</span>
              </div>
           </div>
        </div>

      </div>

    </div>
  );
}