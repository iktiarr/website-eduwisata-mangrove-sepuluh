"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function MaintenanceGuard() {
  const router = useRouter();

  // Fungsi untuk Menendang User
  const kickUser = async () => {
    console.log("Maintenance Mode Activated: Logging out user...");
    
    // 1. Logout dari Supabase Auth
    await supabase.auth.signOut();
    
    // 2. Hapus Data LocalStorage (Sesuai sistem login manual Anda)
    localStorage.removeItem("user");

    // 3. Lempar ke halaman Maintenance
    router.replace("/maintenance");
  };

  useEffect(() => {
    // A. CEK AWAL (Saat halaman baru dibuka)
    const checkStatus = async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("is_enabled")
        .eq("setting_key", "maintenance_mode")
        .single();

      if (data && data.is_enabled) {
        kickUser();
      }
    };

    checkStatus();

    // B. REALTIME LISTENER (Jika Admin tekan tombol saat user sedang online)
    const channel = supabase
      .channel("maintenance_watch")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "app_settings",
          filter: "setting_key=eq.maintenance_mode",
        },
        (payload) => {
          // Jika nilai berubah jadi TRUE (ON)
          if (payload.new.is_enabled === true) {
            kickUser();
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Komponen ini tidak merender apa-apa, cuma logic
  return null;
}