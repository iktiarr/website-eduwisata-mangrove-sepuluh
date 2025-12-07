"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MaintenanceGuard from "../MaintenanceGuard";
import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("user");
    if (session) {
      router.replace("/user/informasi");
    }
  }, [router]);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data: user, error: err } = await supabase
        .from("users")
        .select("*")
        .eq("email", form.email)
        .single();

      if (err || !user) {
        setError("Email atau password salah!");
        setLoading(false);
        return;
      }

      const match = await bcrypt.compare(form.password, user.password);

      if (!match) {
        setError("Email atau password salah!");
        setLoading(false);
        return;
      }

      const { password, ...safeUser } = user;
      localStorage.setItem("user", JSON.stringify(safeUser));

      router.replace("/user/informasi");
    } catch (error) {
      setError("Terjadi kesalahan sistem.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-green-50 px-6 relative overflow-hidden">
      <MaintenanceGuard />

      <div className="absolute inset-0 opacity-20 bg-linear-to-br from-green-300 to-lime-200"></div>
      <div className="absolute top-10 left-10 text-green-700 flex items-center gap-2">
        <Leaf className="w-6 h-6" />
        <span className="font-bold text-lg">Eduwisata Mangrove</span>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl relative z-10 border border-green-100"
      >
        <h1 className="text-3xl font-extrabold mb-6 text-center text-green-700">
          Masuk Akun
        </h1>

        <div className="grid gap-4">
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 pr-12"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm mt-2 text-center">{error}</p>
        )}

        <button
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg mt-6 hover:bg-green-700 transition font-semibold"
        >
          {loading ? "Sedang Memproses..." : "Masuk"}
        </button>

        <p className="text-center mt-4 text-sm text-gray-600">
          Belum punya akun? <Link className="text-green-600 font-semibold underline" href="/user/register">Daftar Di Sini</Link>
        </p>
      </motion.form>
    </main>
  );
}
