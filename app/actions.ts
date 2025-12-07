"use server";

import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

// Inisialisasi Client Supabase (Server Side)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- SKEMA VALIDASI (Sama) ---
const RegisterSchema = z.object({
  nama: z.string().min(3),
  email: z.string().email(),
  noHp: z.string().min(10),
  alamat: z.string().min(5),
  password: z.string().min(6),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// --- FUNGSI REGISTER ---
export async function registerUser(formData: z.infer<typeof RegisterSchema>) {
  // 1. Validasi Zod
  const validated = RegisterSchema.safeParse(formData);
  if (!validated.success) return { success: false, message: "Input tidak valid" };

  const { email, password, nama, noHp, alamat } = validated.data;

  // 2. Daftar ke Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) return { success: false, message: authError.message };
  if (!authData.user) return { success: false, message: "Gagal membuat user" };

  // 3. Simpan data tambahan ke tabel 'users_data'
  const { error: dbError } = await supabase
    .from('users_data') // Pastikan nama tabel sesuai SQL diatas
    .insert({
      id: authData.user.id, // Relasi ke Auth User
      nama: nama,
      no_hp: noHp,
      alamat: alamat
    });

  if (dbError) {
    // Opsional: Hapus user auth jika insert DB gagal agar bersih
    return { success: false, message: "Gagal menyimpan biodata: " + dbError.message };
  }

  return { success: true, message: "Registrasi berhasil! Silakan cek email untuk verifikasi." };
}

// --- FUNGSI LOGIN ---
export async function loginUser(formData: z.infer<typeof LoginSchema>) {
  const { email, password } = formData;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "Login berhasil!" };
}