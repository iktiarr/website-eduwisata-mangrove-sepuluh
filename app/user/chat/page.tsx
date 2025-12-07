"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import MaintenanceGuard from "../MaintenanceGuard";

// --- TIPE DATA ---
type Message = {
  id: number;
  user_id: string;
  sender_role: "user" | "admin";
  message: string;
  created_at: string;
};

type JenisTiket = {
  id: number;
  nama: string;
  harga: number;
};

export default function ChatBookingPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- STATE UTAMA ---
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [loadingChat, setLoadingChat] = useState(true);

  // --- STATE MODAL BOOKING ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [listTiket, setListTiket] = useState<JenisTiket[]>([]);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [successCode, setSuccessCode] = useState("");
  
  // Form Booking
  const [form, setForm] = useState({
    nama_pembeli: "", // Bisa diedit
    nomor_hp: "",     // Baru
    jenis_tiket_id: "",
    jumlah: 1,        // Bisa diketik
    tanggal_kunjungan: "",
  });

  // 1️⃣ INITIAL LOAD
  useEffect(() => {
    const userSession = localStorage.getItem("user");
    if (!userSession) {
      router.replace("/login");
      return;
    }
    const userData = JSON.parse(userSession);
    setUser(userData);

    // Pre-fill form dengan data user (jika ada)
    setForm(prev => ({
        ...prev,
        nama_pembeli: userData.nama_lengkap || userData.name || "",
        nomor_hp: userData.phone || "" // Jika ada di data user
    }));

    // A. Fetch Chat
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", userData.id)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
      setLoadingChat(false);
    };

    // B. Fetch Jenis Tiket
    const fetchTiket = async () => {
        const { data } = await supabase.from("jenis_tiket").select("*").eq("status", true);
        if (data) setListTiket(data);
    };

    fetchMessages();
    fetchTiket();

    // C. Realtime Chat
    const channel = supabase
      .channel("chat_room")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `user_id=eq.${userData.id}`,
        },
        (payload) => setMessages((prev) => [...prev, payload.new as Message])
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 2️⃣ KIRIM PESAN BIASA
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !user) return;
    const msgToSend = inputMsg;
    setInputMsg(""); 
    try {
      await supabase.from("chat_messages").insert([{
          user_id: user.id,
          sender_role: "user",
          message: msgToSend,
      }]);
    } catch (err) { console.error("Gagal kirim chat:", err); }
  };

  // 3️⃣ SUBMIT BOOKING (Database Update)
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingBooking(true);

    if (!form.nama_pembeli || !form.nomor_hp || !form.jenis_tiket_id || !form.tanggal_kunjungan) {
        alert("Mohon lengkapi semua data booking!");
        setLoadingBooking(false);
        return;
    }

    const tiketDipilih = listTiket.find(t => t.id.toString() === form.jenis_tiket_id);
    if (!tiketDipilih) return;

    const totalBayar = tiketDipilih.harga * form.jumlah;
    const ticketIdInt = parseInt(form.jenis_tiket_id);
    
    // Generate Kode Unik: CHAT-{Random 6 Digit}
    const generatedCode = `CHAT-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
        // A. Insert ke Transaksi Online (Rekap Utama)
        // Kolom nomor_hp dan kode_booking SUDAH DITAMBAHKAN di database
        const { error: errTrx } = await supabase.from("transaksi_online").insert([{
            kode_booking: generatedCode, // Simpan kode booking
            nama_pembeli: form.nama_pembeli,
            nomor_hp: form.nomor_hp,     // Simpan no hp
            jenis_tiket_id: ticketIdInt,
            jumlah: form.jumlah,
            tanggal_berangkat: form.tanggal_kunjungan,
            total_harga: totalBayar,
            status_pembayaran: "pending" 
        }]);
        if (errTrx) throw errTrx;

        // B. Insert Tiket Individu (Untuk validasi per orang)
        const ticketsToInsert = [];
        for (let i = 0; i < form.jumlah; i++) {
            ticketsToInsert.push({
                kode: `${generatedCode}-${i+1}`,
                jenis_tiket_id: ticketIdInt,
                nama_pemilik: form.nama_pembeli,
                tanggal_berangkat: form.tanggal_kunjungan,
                status: 'booking_chat', 
            });
        }
        const { error: errTiket } = await supabase.from("tiket").insert(ticketsToInsert);
        if (errTiket) throw errTiket;

        // C. Tampilkan Sukses
        setSuccessCode(generatedCode);

    } catch (err: any) {
        alert("Gagal booking: " + err.message);
    } finally {
        setLoadingBooking(false);
    }
  };

  const closeModal = () => {
      setIsModalOpen(false);
      setSuccessCode("");
      // Reset form tapi pertahankan nama/hp user
      setForm(prev => ({ ...prev, jenis_tiket_id: "", jumlah: 1, tanggal_kunjungan: "" })); 
  };

  const copyToChat = () => {
      // Mengirim detail lengkap ke chat agar admin tidak perlu cek DB terus
      const tiketNama = listTiket.find(t => t.id.toString() === form.jenis_tiket_id)?.nama;
      const total = listTiket.find(t => t.id.toString() === form.jenis_tiket_id)?.harga || 0 * form.jumlah;

      const pesanKonfirmasi = `✅ Saya sudah isi form booking kak.
Kode: ${successCode}
A.n: ${form.nama_pembeli} (${form.nomor_hp})
Tiket: ${tiketNama} (${form.jumlah} org)
Tgl: ${form.tanggal_kunjungan}`;

      setInputMsg(pesanKonfirmasi);
      closeModal();
  };

  if (loadingChat) return <div className="h-screen flex items-center justify-center">Memuat chat...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col relative">
      <div className="bg-green-600 p-4 sticky top-0 z-10 shadow-md flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 hover:bg-green-700 rounded-full">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div>
               <h1 className="text-lg font-bold">Admin Reservasi</h1>
               <p className="text-xs text-green-100 flex items-center gap-1">
                 <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span> Online
               </p>
            </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-white text-green-700 text-xs md:text-sm font-bold px-4 py-2 rounded-full shadow-sm hover:bg-green-50 active:scale-95 transition-all flex items-center gap-2">
            <span>📝</span> <span className="hidden md:inline">Isi Form</span> Booking
        </button>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
        <div className="flex justify-center">
            <div className="bg-yellow-50 text-yellow-800 text-xs px-4 py-2 rounded-full border border-yellow-100 shadow-sm">
                🔒 Klik "Isi Form" untuk booking resmi.
            </div>
        </div>
        {messages.map((msg) => {
          const isMe = msg.sender_role === "user";
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] md:max-w-[60%] p-3 rounded-2xl shadow-sm text-sm whitespace-pre-wrap ${
                  isMe ? "bg-green-600 text-white rounded-tr-none" : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
                }`}>
                <p>{msg.message}</p>
                <p className={`text-[10px] mt-1 text-right ${isMe ? "text-green-200" : "text-gray-400"}`}>
                  {new Date(msg.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT CHAT */}
      <div className="bg-white p-3 border-t border-gray-200 sticky bottom-0 z-10">
        <form onSubmit={handleSendChat} className="max-w-4xl mx-auto flex gap-2">
          <textarea
            rows={1}
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            className="flex-1 p-3 bg-gray-50 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            placeholder="Tulis pesan..."
          />
          <button type="submit" disabled={!inputMsg.trim()} className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>

      {/* ========================================================== */}
      {/* MODAL POP-UP BOOKING FORM */}
      {/* ========================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              
              {/* Header Modal */}
              <div className="bg-green-600 p-4 flex justify-between items-center text-white shrink-0">
                 <h2 className="font-bold text-lg">{successCode ? "Booking Berhasil! 🎉" : "Form Booking"}</h2>
                 <button onClick={closeModal} className="p-1 hover:bg-green-700 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>

              {/* BODY MODAL (Scrollable) */}
              <div className="p-6 overflow-y-auto">
                 {successCode ? (
                    <div className="text-center space-y-4">
                        <p className="text-gray-600 text-sm">Kode ini telah disimpan di sistem.</p>
                        <div className="bg-gray-100 p-3 rounded-xl border border-dashed border-gray-300">
                            <p className="text-2xl font-mono font-bold text-green-700">{successCode}</p>
                        </div>
                        <button onClick={copyToChat} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 shadow-md">Salin ke Chat & Tutup</button>
                    </div>
                 ) : (
                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                        {/* Nama (Editable) */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Nama Pemesan</label>
                            <input 
                                type="text"
                                required
                                value={form.nama_pembeli}
                                onChange={(e) => setForm({...form, nama_pembeli: e.target.value})}
                                className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="Nama Lengkap"
                            />
                        </div>

                        {/* Nomor HP (Baru) */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Nomor WhatsApp / HP</label>
                            <input 
                                type="tel"
                                required
                                value={form.nomor_hp}
                                onChange={(e) => setForm({...form, nomor_hp: e.target.value})}
                                className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="0812xxxx"
                            />
                        </div>

                        {/* Tanggal */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Tanggal Kunjungan</label>
                            <input 
                                type="date"
                                required
                                min={new Date().toISOString().split("T")[0]} 
                                value={form.tanggal_kunjungan}
                                onChange={(e) => setForm({...form, tanggal_kunjungan: e.target.value})}
                                className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>

                        {/* Jenis Tiket */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Jenis Tiket</label>
                            <select 
                                required
                                value={form.jenis_tiket_id}
                                onChange={(e) => setForm({...form, jenis_tiket_id: e.target.value})}
                                className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                            >
                                <option value="" disabled>-- Pilih Tiket --</option>
                                {listTiket.map((t) => (
                                    <option key={t.id} value={t.id}>{t.nama} - Rp {t.harga.toLocaleString()}</option>
                                ))}
                            </select>
                        </div>

                        {/* Jumlah (Manual Input + Button) */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Jumlah Orang</label>
                            <div className="flex items-center gap-3 mt-1">
                                <button type="button" onClick={() => setForm(p => ({...p, jumlah: Math.max(1, p.jumlah - 1)}))} className="w-10 h-10 bg-gray-100 rounded-lg font-bold hover:bg-gray-200">-</button>
                                <input 
                                    type="number" 
                                    min="1"
                                    value={form.jumlah} 
                                    onChange={(e) => setForm({...form, jumlah: parseInt(e.target.value) || 1})} // Bisa diketik manual
                                    className="flex-1 text-center font-bold bg-white border border-gray-200 rounded-lg h-10 focus:ring-2 focus:ring-green-500 outline-none" 
                                />
                                <button type="button" onClick={() => setForm(p => ({...p, jumlah: p.jumlah + 1}))} className="w-10 h-10 bg-green-100 text-green-700 rounded-lg font-bold hover:bg-green-200">+</button>
                            </div>
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                             <span className="text-sm font-bold text-gray-500">Total Estimasi</span>
                             <span className="text-lg font-bold text-green-600">
                                Rp {(
                                    (listTiket.find(t => t.id.toString() === form.jenis_tiket_id)?.harga || 0) * form.jumlah
                                ).toLocaleString('id-ID')}
                             </span>
                        </div>

                        <button 
                            type="submit"
                            disabled={loadingBooking}
                            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 shadow-md transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loadingBooking ? "Menyimpan Data..." : "Konfirmasi Booking"}
                        </button>
                    </form>
                 )}
              </div>
           </div>
        </div>
      )}

    </div>
  );
}