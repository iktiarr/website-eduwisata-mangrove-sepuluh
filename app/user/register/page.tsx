"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";
import MaintenanceGuard from "../MaintenanceGuard";
import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const hashedPassword = await bcrypt.hash(form.password, 10);

      const { error } = await supabase.from("users").insert([
        {
          name: form.name,
          phone: form.phone,
          address: form.address,
          email: form.email,
          password: hashedPassword,
        },
      ]);

      if (error) throw error;

      window.location.href = "/user/login";
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
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
          Daftar Akun Baru
        </h1>

        <div className="grid gap-4">
          <input
            type="text"
            placeholder="Nama Lengkap"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            type="text"
            placeholder="Nomor HP"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400"
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <input
            type="text"
            placeholder="Alamat"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400"
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm mt-2 text-center">{error}</p>
        )}

        <button
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg mt-6 hover:bg-green-700 transition font-semibold"
        >
          {loading ? "Mendaftar..." : "Daftar"}
        </button>

        <p className="text-center mt-4 text-sm text-gray-600">
          Sudah punya akun?{" "}
          <a className="text-green-600 font-semibold underline" href="/user/login">
            Login Di Sini
          </a>
        </p>
      </motion.form>
    </main>
  );
}