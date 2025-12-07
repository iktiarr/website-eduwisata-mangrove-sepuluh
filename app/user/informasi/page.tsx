"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import MaintenanceGuard from "../MaintenanceGuard";

type WaktuOperasionalType = {
  id: number;
  nama_hari: string;
  jam_buka: string;
  jam_tutup: string;
  keterangan: 'buka' | 'tutup' | 'dipesan';
};

type Pengumuman = {
  id: number;
  judul: string;
  isi: string;
  tipe: 'info' | 'penting' | 'promo';
  created_at: string;
};

function AnnouncementCarousel() {
  const [announcements, setAnnouncements] = useState<Pengumuman[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data } = await supabase
        .from("pengumuman")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (data) setAnnouncements(data as Pengumuman[]);
    };
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length <= 3) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [announcements.length]);

  if (announcements.length === 0) return null;

  const currentItem = announcements[currentIndex];

  const getStyle = (tipe: string) => {
    switch (tipe) {
      case 'penting':
        return {
          container: "bg-red-50 border-red-200",
          textTitle: "text-red-800",
          textBody: "text-red-700",
          iconBg: "bg-red-100 text-red-600",
          icon: "⚠️"
        };
      case 'promo':
        return {
          container: "bg-green-50 border-green-200",
          textTitle: "text-green-800",
          textBody: "text-green-700",
          iconBg: "bg-green-100 text-green-600",
          icon: "🎉"
        };
      default:
        return {
          container: "bg-blue-50 border-blue-200",
          textTitle: "text-blue-800",
          textBody: "text-blue-700",
          iconBg: "bg-blue-100 text-blue-600",
          icon: "ℹ️"
        };
    }
  };

  const style = getStyle(currentItem.tipe);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative overflow-hidden">
      <MaintenanceGuard />
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Papan Pengumuman</h2>

            <div className="ml-auto flex gap-1">
                {announcements.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`h-2 w-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-gray-800 w-4' : 'bg-gray-300'}`}
                    ></div>
                ))}
            </div>
        </div>

        <div key={currentIndex} className={`p-4 rounded-xl border ${style.container} flex items-start gap-4 animate-in fade-in slide-in-from-right-4 duration-500`}>
            <div className={`p-2 rounded-lg shrink-0 text-xl ${style.iconBg} flex items-center justify-center w-10 h-10`}>
                {style.icon}
            </div>
            <div>
                <h4 className={`font-bold text-sm md:text-base ${style.textTitle}`}>{currentItem.judul}</h4>
                <p className={`text-sm mt-1 opacity-90 ${style.textBody}`}>{currentItem.isi}</p>
                <p className="text-[10px] mt-2 opacity-60">
                    {new Date(currentItem.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                </p>
            </div>
        </div>
    </div>
  );
}

export default function UserHome() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [jadwal, setJadwal] = useState<WaktuOperasionalType[]>([]);
  const [loadingJadwal, setLoadingJadwal] = useState(true);

  useEffect(() => {
    const sessionData = localStorage.getItem("user");
    if (!sessionData) {
      router.replace("/login");
      return;
    }
    setUser(JSON.parse(sessionData));

    const fetchJadwal = async () => {
      try {
        const { data, error } = await supabase
          .from("waktu_operasional")
          .select("*")
          .order("id", { ascending: true });

        if (error) throw error;
        if (data) setJadwal(data);
      } catch (err) {
        console.error("Gagal ambil jam operasional:", err);
      } finally {
        setLoadingJadwal(false);
      }
    };

    fetchJadwal();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    router.replace("/user/login");
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Memuat...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 p-4 md:p-8">
      <MaintenanceGuard />
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              Halo, <span className="text-green-600">{user.nama_lengkap || user.name || "Pengunjung"}</span>!
            </h1>
          </div>

          <button 
            onClick={handleLogout}
            className="mt-4 md:mt-0 flex items-center gap-2 bg-white border border-red-200 text-red-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 hover:border-red-300 transition-all shadow-sm active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Keluar Akun
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">

            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-green-700 to-teal-600 text-white shadow-xl group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:opacity-20 transition-opacity duration-500"></div>
              
              <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-center md:text-left">
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-4 border border-white/10 uppercase tracking-wider">
                    Modul Pembelajaran
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">
                    Ekosistem Mangrove Digital
                  </h2>
                  <p className="text-green-50 text-base mb-6 leading-relaxed max-w-lg">
                    Akses materi interaktif tentang pelestarian, identifikasi jenis, dan manfaat ekonomi hutan bakau.
                  </p>
                  
                  <Link href="/user/edukasi" className="inline-block bg-white text-green-800 font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-green-50 hover:scale-105 transition-all w-full md:w-auto text-center">
                    Mulai Belajar
                  </Link>
                </div>
                
                <div className="hidden md:block shrink-0">
                   <div className="w-32 h-32 bg-white/10 backdrop-blur rounded-full flex items-center justify-center border border-white/20 shadow-inner">
                     <span className="text-6xl">🌱</span>
                   </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/user/tiket" className="group">
                <div className="h-full p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900">Pesan Tiket</h3>
                </div>
              </Link>

              <Link href="/user/penilaian" className="group">
                <div className="h-full p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-300 transition-all cursor-pointer flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900">Penilaian</h3>
                </div>
              </Link>

              <Link href="/user/chat" className="group">
                <div className="h-full p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-green-300 transition-all cursor-pointer flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10m-12 9h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900">Booking & Chat</h3>
                </div>
              </Link>
            </div>

            <AnnouncementCarousel />

            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Lokasi</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div>
                        <h4 className="font-bold text-gray-800">Alamat</h4>
                        <p className="text-gray-600 text-sm">Labuhan, Kec. Sepulu, Kabupaten Bangkalan, Jawa Timur 69154</p>
                        </div>
                    </div>
                    <div className="h-48 md:h-full w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28435.908718313734!2d112.98647086626137!3d-6.891315626806491!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd8157bb6c3ffe5%3A0x1b2fd1cc4ea53676!2sTaman%20Belajar%20Mangrove%20Labuhan!5e0!3m2!1sid!2sid!4v1764391747459!5m2!1sid!2sid" width="100%" height="100%" style={{border:0}} allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Fasilitas & Wahana</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md transition-all text-center">
                        <div className="w-12 h-12 mx-auto bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-3 text-2xl">📸</div>
                        <h4 className="font-bold text-gray-800 mb-1">Spot Foto</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">Berbagai area estetik untuk mengabadikan momen bersama alam.</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md transition-all text-center">
                        <div className="w-12 h-12 mx-auto bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3 text-2xl">🛖</div>
                        <h4 className="font-bold text-gray-800 mb-1">Gazebo</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">Tempat istirahat nyaman di bawah kerindangan pohon bakau.</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md transition-all text-center">
                        <div className="w-12 h-12 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 text-2xl">🚻</div>
                        <h4 className="font-bold text-gray-800 mb-1">Toilet Bersih</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">Fasilitas toilet umum yang terawat dan bersih untuk pengunjung.</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md transition-all text-center">
                        <div className="w-12 h-12 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3 text-2xl">🕌</div>
                        <h4 className="font-bold text-gray-800 mb-1">Musholla</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">Area ibadah yang tenang dan nyaman tersedia di lokasi.</p>
                    </div>
                </div>
            </div>

          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm sticky top-8">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <div className="p-2 bg-green-100 rounded-lg text-green-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Waktu Operasional</h3>
              </div>

              {loadingJadwal ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ) : jadwal.length === 0 ? (
                <p className="text-gray-500 text-sm">Data jadwal belum tersedia.</p>
              ) : (
                <div className="space-y-4">
                  {jadwal.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm group hover:bg-gray-50 p-2 rounded transition-colors">
                      <span className="font-medium text-gray-700 w-24">{item.nama_hari}</span>
                      {item.keterangan === 'tutup' ? (
                        <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-bold">TUTUP</span>
                      ) : item.keterangan === 'dipesan' ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold">DIPESAN</span>
                      ) : (
                        <span className="text-gray-600 font-mono text-right flex-1">{item.jam_buka.slice(0, 5)} - {item.jam_tutup.slice(0, 5)}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center">*Jadwal dapat berubah sewaktu-waktu.</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}