"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

// --- TIPE DATA ---
type Message = {
  id: number;
  user_id: string; // ID Pengunjung
  sender_role: "user" | "admin";
  message: string;
  created_at: string;
};

type ChatSession = {
  user_id: string;
  user_name: string;
  last_message: string;
  last_time: string;
  unread_count: number;
};

export default function MenuBookingChat() {
  // State Data
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // State UI
  const [inputText, setInputText] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  
  // REFS (PENTING UNTUK LOGIKA REALTIME)
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Ref ini menyimpan ID user yang sedang dibuka chatnya.
  // Kita butuh ini karena di dalam useEffect Realtime, state 'activeSession' nilainya bisa usang (stale).
  const activeSessionIdRef = useRef<string | null>(null);

  // 1️⃣ INITIAL LOAD
  useEffect(() => {
    fetchChatList();

    // SETUP REALTIME
    const channel = supabase
      .channel("admin_global_chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          handleRealtimeMessage(payload.new as Message);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Scroll ke bawah otomatis
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update Ref setiap kali activeSession berubah
  useEffect(() => {
    activeSessionIdRef.current = activeSession?.user_id || null;
  }, [activeSession]);

  // --- LOGIC 1: FETCH DAFTAR USER ---
  const fetchChatList = async () => {
    setLoadingList(true);
    try {
      const { data: allMsg } = await supabase
        .from("chat_messages")
        .select("user_id, message, created_at, sender_role")
        .order("created_at", { ascending: false });

      if (!allMsg || allMsg.length === 0) {
        setLoadingList(false);
        return;
      }

      // Ambil Unique User ID
      const userIds = Array.from(new Set(allMsg.map(m => m.user_id)));

      // Ambil Nama User
      const { data: usersData } = await supabase
        .from("users")
        .select("id, name")
        .in("id", userIds);

      const userMap = new Map();
      usersData?.forEach(u => userMap.set(u.id, u.name));

      // Grouping
      const sessionMap = new Map<string, ChatSession>();
      allMsg.forEach((msg) => {
        if (!sessionMap.has(msg.user_id)) {
          sessionMap.set(msg.user_id, {
            user_id: msg.user_id,
            user_name: userMap.get(msg.user_id) || "Pengunjung",
            last_message: msg.message,
            last_time: msg.created_at,
            unread_count: 0
          });
        }
        // Hitung Unread
        if (msg.sender_role === 'user') {
           const s = sessionMap.get(msg.user_id);
           if (s) s.unread_count += 1;
        }
      });

      setSessions(Array.from(sessionMap.values()));
    } catch (err) {
      console.error("Error fetching list:", err);
    } finally {
      setLoadingList(false);
    }
  };

  // --- LOGIC 2: BUKA CHAT ROOM ---
  const handleSelectUser = async (session: ChatSession) => {
    setActiveSession(session);
    setLoadingChat(true);
    
    // Reset Unread di Sidebar
    setSessions(prev => prev.map(s => s.user_id === session.user_id ? { ...s, unread_count: 0 } : s));

    // Fetch Pesan
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", session.user_id)
      .order("created_at", { ascending: true });

    setMessages(data || []);
    setLoadingChat(false);
  };

  // --- LOGIC 3: REALTIME HANDLER (KUNCI PERBAIKAN) ---
  const handleRealtimeMessage = async (newMessage: Message) => {
    const currentOpenChatId = activeSessionIdRef.current; // Baca dari Ref yang selalu update

    // A. Update Layar Chat (Jika sedang membuka user tersebut)
    if (currentOpenChatId === newMessage.user_id) {
      setMessages((prev) => {
        // Cek duplikasi (Anti double bubble)
        if (prev.some(m => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    }

    // B. Update Sidebar (User naik ke atas)
    let senderName = "Pengunjung Baru";
    
    setSessions((prevSessions) => {
      const existingSession = prevSessions.find(s => s.user_id === newMessage.user_id);
      
      if (existingSession) senderName = existingSession.user_name;
      
      const otherSessions = prevSessions.filter(s => s.user_id !== newMessage.user_id);
      
      // Hitung unread: Kalau pesan dari user DAN admin TIDAK sedang buka chat itu -> Tambah 1
      const isUnread = (newMessage.sender_role === 'user' && currentOpenChatId !== newMessage.user_id);
      
      const updatedSession: ChatSession = {
        user_id: newMessage.user_id,
        user_name: senderName,
        last_message: newMessage.message,
        last_time: newMessage.created_at,
        unread_count: isUnread 
          ? (existingSession ? existingSession.unread_count + 1 : 1) 
          : 0 // Kalau admin balas atau sedang dibuka, unread 0
      };

      return [updatedSession, ...otherSessions];
    });

    // Jika user benar-benar baru, ambil namanya
    if (senderName === "Pengunjung Baru") {
       const { data } = await supabase.from("users").select("name").eq("id", newMessage.user_id).single();
       if (data) {
         setSessions(prev => prev.map(s => s.user_id === newMessage.user_id ? { ...s, user_name: data.name } : s));
       }
    }
  };

  // --- LOGIC 4: KIRIM BALASAN ---
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeSession) return;

    const msgToSend = inputText;
    setInputText("");

    try {
      await supabase.from("chat_messages").insert([{
        user_id: activeSession.user_id,
        sender_role: "admin",
        message: msgToSend
      }]);
      // Tidak perlu setMessages manual, biarkan Realtime di atas yang menanganinya
    } catch (err: any) {
      toast.error("Gagal kirim: " + err.message);
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] border border-slate-200 bg-white rounded-xl overflow-hidden shadow-sm font-sans text-slate-900">
      
      {/* === SIDEBAR (DAFTAR USER) === */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="font-bold text-slate-800">Inbox Pesan</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loadingList ? (
            <p className="p-4 text-center text-slate-400 text-sm">Memuat...</p>
          ) : sessions.length === 0 ? (
            <p className="p-4 text-center text-slate-400 text-sm">Belum ada pesan.</p>
          ) : (
            sessions.map((s) => (
              <button
                key={s.user_id}
                onClick={() => handleSelectUser(s)}
                className={`w-full text-left p-4 border-b border-slate-100 transition-all hover:bg-white flex gap-3 items-start ${
                  activeSession?.user_id === s.user_id ? "bg-white border-l-4 border-l-green-600 shadow-sm" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold shrink-0 uppercase">
                  {s.user_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className={`text-sm font-bold truncate ${s.unread_count > 0 ? 'text-slate-900' : 'text-slate-600'}`}>
                      {s.user_name}
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      {new Date(s.last_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-xs truncate ${s.unread_count > 0 ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                    {s.last_message}
                  </p>
                </div>
                {s.unread_count > 0 && activeSession?.user_id !== s.user_id && (
                  <div className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">
                    {s.unread_count}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* === CHAT AREA === */}
      <div className="flex-1 flex flex-col bg-white">
        {activeSession ? (
          <>
            {/* Header Chat */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold uppercase">
                  {activeSession.user_name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">{activeSession.user_name}</h2>
                </div>
              </div>
            </div>

            {/* List Pesan */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
              {loadingChat ? (
                <div className="text-center text-slate-400 mt-10">Memuat percakapan...</div>
              ) : (
                messages.map((msg, idx) => {
                  const isAdmin = msg.sender_role === "admin";
                  return (
                    <div key={msg.id || idx} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${
                        isAdmin 
                          ? "bg-green-600 text-white rounded-tr-none" 
                          : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                      }`}>
                        <p>{msg.message}</p>
                        <p className={`text-[10px] mt-1 text-right ${isAdmin ? "text-green-200" : "text-slate-400"}`}>
                          {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <form onSubmit={handleSendReply} className="flex gap-2">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 p-3 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  placeholder="Ketik balasan..."
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 shadow-lg disabled:opacity-50 transition-transform active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-4xl">💬</div>
            <h3 className="font-bold text-slate-600">Pilih Percakapan</h3>
          </div>
        )}
      </div>
    </div>
  );
}