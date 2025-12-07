"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function KasirLogin() {
  const [code, setCode] = useState("");

  const handleLogin = async (e: any) => {
    e.preventDefault();

    if (!code) return toast.error("Kode tidak boleh kosong!");

    const { data, error } = await supabase
      .from("role_codes")
      .select("*")
      .eq("role", "kasir")
      .eq("code", code)
      .single();

    if (error || !data) {
      return toast.error("Kode salah! Coba lagi.");
    }

    toast.success("Berhasil masuk sebagai Kasir!");
    localStorage.setItem("role", "kasir");

    window.location.href = "/dashboard/kasir";
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm"
      >
        <h1 className="text-xl font-bold mb-4 text-center">Kasir Login</h1>

        <Input
          placeholder="Masukkan kode"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="mb-3"
        />

        <Button type="submit" className="w-full">
          Masuk
        </Button>
      </form>
    </main>
  );
}
