"use client";

import Link from "next/link";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center font-sans">
      
      {/* Icon Animasi */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-20 animate-pulse"></div>
        <div className="relative bg-slate-800 p-6 rounded-full border-2 border-slate-700 shadow-2xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
          </svg>
        </div>
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
        Sistem Sedang <span className="text-yellow-500">Diperbarui</span>
      </h1>
      
      <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed mb-10">
        Kami sedang melakukan peningkatan performa dan keamanan sistem. 
        Mohon maaf atas ketidaknyamanan ini. Silakan coba beberapa saat lagi.
      </p>

      {/* Tombol Kembali ke Home (Karena Home aman) */}
      <Link 
        href="/"
        className="px-8 py-3 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-200 transition-all active:scale-95 shadow-lg flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
        Kembali ke Beranda
      </Link>

      <div className="mt-12 text-sm text-slate-600 font-mono">
        Status: MAINTENANCE_MODE_ON
      </div>
    </div>
  );
}