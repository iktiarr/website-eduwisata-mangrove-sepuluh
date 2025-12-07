"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import bcrypt from "bcryptjs"; // Pastikan sudah install: npm install bcryptjs @types/bcryptjs

// --- TIPE DATA ---
type UserData = {
  id: string; // UUID
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
};

export default function MenuUser() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // State Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "", // Password text (akan di-hash atau kirim raw)
  });

  // 1️⃣ LOAD DATA USER
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, phone, address, created_at") // Jangan ambil password demi keamanan
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Gagal memuat users");
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  // 2️⃣ HANDLE INPUT
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3️⃣ SUBMIT (TAMBAH / EDIT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi dasar
    if (!formData.name || !formData.email) {
      toast.warning("Nama dan Email wajib diisi!");
      return;
    }

    // Hash Password (Jika diisi)
    let payload: any = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
    };

    // Logika Password
    if (formData.password) {
      // Enkripsi password sebelum kirim ke DB
      const hashedPassword = await bcrypt.hash(formData.password, 10);
      payload.password = hashedPassword;
    } else if (!isEditing) {
      // Kalau Mode Tambah Baru, Password Wajib Ada
      toast.warning("Password wajib diisi untuk user baru!");
      return;
    }

    try {
      if (isEditing && currentId) {
        // --- UPDATE ---
        const { error } = await supabase
          .from("users")
          .update(payload)
          .eq("id", currentId);
        
        if (error) throw error;
        toast.success("Data user diperbarui");
      } else {
        // --- INSERT ---
        const { error } = await supabase
          .from("users")
          .insert([payload]);
        
        if (error) throw error;
        toast.success("User baru berhasil ditambahkan");
      }

      closeModal();
      fetchUsers();

    } catch (err: any) {
      toast.error("Gagal menyimpan: " + err.message);
    }
  };

  // 4️⃣ HAPUS USER
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus user "${name}"?`)) return;

    try {
      const { error } = await supabase.from("users").delete().eq("id", id);
      if (error) throw error;
      
      toast.success("User dihapus");
      fetchUsers();
    } catch (err: any) {
      toast.error("Gagal menghapus: " + err.message);
    }
  };

  // Helper Modal
  const openAddModal = () => {
    setFormData({ name: "", email: "", phone: "", address: "", password: "" });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserData) => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
      password: "", // Kosongkan password saat edit (biar gak ketimpa kalau user gak mau ubah)
    });
    setCurrentId(user.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentId(null);
  };

  // Filter Search
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-slate-900">
      
      {/* HEADER PAGE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Manajemen User</h1>
          <p className="text-slate-500 text-sm">Kelola data pengguna aplikasi.</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <input 
            type="text" 
            placeholder="Cari Nama / Email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
          />
          <button 
            onClick={openAddModal}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shrink-0"
          >
            + User Baru
          </button>
        </div>
      </div>

      {/* TABEL USER */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="p-4">Nama Lengkap</th>
                <th className="p-4">Kontak</th>
                <th className="p-4">Alamat</th>
                <th className="p-4 text-center">Terdaftar</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Memuat data...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Tidak ada user ditemukan.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-400 font-mono">ID: {user.id.slice(0,8)}...</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-700">{user.email}</div>
                      <div className="text-xs text-slate-500">{user.phone || "-"}</div>
                    </td>
                    <td className="p-4 max-w-xs truncate text-slate-600">
                      {user.address || "-"}
                    </td>
                    <td className="p-4 text-center text-slate-500 text-xs">
                      {new Date(user.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => openEditModal(user)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id, user.name)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 transition-colors"
                          title="Hapus"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL FORM (ADD / EDIT) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            
            {/* Header Modal */}
            <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
              <h2 className="font-bold text-lg">{isEditing ? "Edit Data User" : "Tambah User Baru"}</h2>
              <button onClick={closeModal} className="hover:bg-slate-700 p-1 rounded-full text-slate-300 hover:text-white transition-colors">✕</button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Lengkap *</label>
                <input 
                  type="text" name="name" 
                  value={formData.name} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                  placeholder="Nama User"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email *</label>
                  <input 
                    type="email" name="email" 
                    value={formData.email} onChange={handleChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                    placeholder="email@contoh.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">No. HP</label>
                  <input 
                    type="text" name="phone" 
                    value={formData.phone} onChange={handleChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                    placeholder="0812..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alamat</label>
                <textarea 
                  name="address" rows={2}
                  value={formData.address} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none resize-none"
                  placeholder="Alamat lengkap..."
                />
              </div>

              <div className="pt-2 border-t border-slate-100 mt-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Password {isEditing && <span className="text-red-500 normal-case font-normal">(Kosongkan jika tidak ingin mengubah)</span>}
                </label>
                <input 
                  type="password" name="password" 
                  value={formData.password} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-slate-50"
                  placeholder={isEditing ? "••••••" : "Buat password baru"}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 py-2.5 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50">
                  Batal
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 shadow-lg">
                  Simpan Data
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}