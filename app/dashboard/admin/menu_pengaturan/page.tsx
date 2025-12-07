"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export default function MenuPengaturan() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1️⃣ LOAD STATUS SAAT INI
  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("is_enabled")
        .eq("setting_key", "maintenance_mode")
        .single();

      if (data) setIsMaintenance(data.is_enabled);
      setLoading(false);
    };
    fetchSettings();
  }, []);

  // 2️⃣ TOGGLE SWITCH
  const handleToggle = async () => {
    const newValue = !isMaintenance;
    
    // Optimistic Update (Ubah UI duluan biar cepet)
    setIsMaintenance(newValue);

    try {
      const { error } = await supabase
        .from("app_settings")
        .update({ is_enabled: newValue })
        .eq("setting_key", "maintenance_mode");

      if (error) throw error;

      if (newValue) {
        toast.warning("Mode Perbaikan DIAKTIFKAN. Website user terkunci.");
      } else {
        toast.success("Website kembali ONLINE.");
      }

    } catch (err: any) {
      setIsMaintenance(!newValue); // Balikin kalau gagal
      toast.error("Gagal mengubah pengaturan");
    }
  };

  return (
    <div className="space-y-8 font-sans text-slate-900">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Pengaturan Website</h1>
        <p className="text-slate-500 text-sm">Kontrol status dan konfigurasi sistem.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Item 1: Maintenance Mode */}
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-4 items-start">
            <div className={`p-3 rounded-full shrink-0 ${isMaintenance ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
               </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">Mode Perbaikan (Maintenance)</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-lg">
                Jika diaktifkan, seluruh halaman pengunjung (User) akan ditutup dan menampilkan pesan "Sedang Dalam Perbaikan". 
                <br/><span className="text-red-500 font-medium">Admin tetap bisa mengakses dashboard.</span>
              </p>
            </div>
          </div>

          {/* Switch Button */}
          <div className="flex items-center gap-3">
             <span className={`text-sm font-bold ${isMaintenance ? 'text-orange-600' : 'text-slate-400'}`}>
                {isMaintenance ? "AKTIF" : "NONAKTIF"}
             </span>
             <button 
               onClick={handleToggle}
               disabled={loading}
               className={`w-14 h-8 flex items-center rounded-full p-1 transition-all duration-300 shadow-inner ${
                 isMaintenance ? 'bg-orange-500' : 'bg-slate-300'
               }`}
             >
               <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                 isMaintenance ? 'translate-x-6' : 'translate-x-0'
               }`}></div>
             </button>
          </div>
        </div>

        {/* Footer Info */}
        {isMaintenance && (
           <div className="bg-orange-50 border-t border-orange-100 p-4 text-center">
              <p className="text-orange-700 text-sm font-bold">⚠️ Website sedang dikunci untuk publik.</p>
           </div>
        )}

      </div>
    </div>
  );
}