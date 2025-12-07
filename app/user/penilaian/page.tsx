"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import MaintenanceGuard from "../MaintenanceGuard";

type UlasanType = {
  id: number;
  nama_pengirim: string;
  rating: number;
  komentar: string;
  created_at: string;
};

export default function PenilaianPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    rating: 0,
    komentar: "",
    isAnonymous: false,
  });

  const [reviews, setReviews] = useState<UlasanType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const userSession = localStorage.getItem("user");
    if (userSession) {
      const user = JSON.parse(userSession);
      setUserName(user.nama_lengkap || user.name || "Pengunjung");
    } else {
      router.replace("/login");
    }
    fetchReviews();
  }, [router]);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("ulasan")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setReviews(data);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (form.rating === 0 || !form.komentar) {
      alert("Mohon isi bintang dan komentar!");
      setLoading(false);
      return;
    }

    const namaFinal = form.isAnonymous ? "Anonymous" : userName;

    const payload = {
      nama_pengirim: namaFinal,
      rating: form.rating,
      komentar: form.komentar,
      is_anonymous: form.isAnonymous,
    };

    try {
      const { error } = await supabase.from("ulasan").insert([payload]);
      if (error) throw error;

      alert("Terima kasih atas penilaian Anda!");
      setForm({ rating: 0, komentar: "", isAnonymous: false });
      fetchReviews(); 
      setCurrentIndex(0);

    } catch (err: any) {
      alert("Gagal kirim ulasan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    if (currentIndex < reviews.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
        setCurrentIndex(0);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const renderStars = (count: number) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < count ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex items-center gap-4">
           <button onClick={() => router.back()} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
           </button>
           <h1 className="text-3xl font-bold text-gray-900">Penilaian & Ulasan</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-4">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Berikan Ulasanmu ✍️</h2>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <svg
                        className={`w-10 h-10 ${
                          star <= form.rating
                            ? "text-yellow-400 fill-yellow-400 drop-shadow-sm"
                            : "text-gray-300 hover:text-yellow-200"
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-green-600 mt-2 font-medium">
                  {form.rating === 5 ? "Luar Biasa! 😍" : 
                   form.rating === 4 ? "Sangat Bagus 😄" :
                   form.rating === 3 ? "Cukup Bagus 🙂" :
                   form.rating > 0 ? "Perlu Perbaikan 😔" : "Pilih bintang"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Komentar</label>
                <textarea
                  rows={4}
                  value={form.komentar}
                  onChange={(e) => setForm({ ...form, komentar: e.target.value })}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none bg-gray-50"
                  placeholder="Ceritakan pengalaman serumu..."
                  required
                />
              </div>

              <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <input
                  type="checkbox"
                  id="anonToggle"
                  checked={form.isAnonymous}
                  onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500 cursor-pointer"
                />
                <label htmlFor="anonToggle" className="cursor-pointer select-none">
                  <span className="block text-sm font-bold text-gray-800">Kirim sebagai Anonymous</span>
                  <span className="block text-xs text-gray-500">
                    Nama <span className="font-bold text-gray-700">{userName}</span> tidak akan ditampilkan.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-transform active:scale-95 ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {loading ? "Mengirim..." : "Kirim Ulasan"}
              </button>
            </form>
          </div>

          <div>
             <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Apa Kata Mereka? 💬</h2>
                    <p className="text-gray-500 mt-1">Ulasan terbaru dari pengunjung lain.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={prevSlide} className="p-2 rounded-full border border-gray-300 hover:bg-white hover:shadow-md transition bg-gray-50">
                        ⬅️
                    </button>
                    <button onClick={nextSlide} className="p-2 rounded-full border border-gray-300 hover:bg-white hover:shadow-md transition bg-gray-50">
                        ➡️
                    </button>
                </div>
             </div>

            <div className="relative overflow-hidden h-[500px] w-full">
                {reviews.length === 0 ? (
                    <div className="h-full flex items-center justify-center bg-white rounded-3xl border border-dashed border-gray-300">
                        <p className="text-gray-400">Belum ada ulasan. Jadilah yang pertama!</p>
                    </div>
                ) : (
                    <div className="relative h-full">
                        {reviews.map((review, index) => {
                             const position = index - currentIndex;
                             if (position < 0 || position > 2) return null;

                             return (
                                <div 
                                    key={review.id}
                                    className={`absolute top-0 left-0 w-full transition-all duration-500 ease-in-out`}
                                    style={{
                                        transform: `translateY(${position * 110}px) scale(${1 - position * 0.05})`,
                                        opacity: 1 - position * 0.3,
                                        zIndex: 10 - position
                                    }}
                                >
                                    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                                                    review.nama_pengirim === 'Anonymous' 
                                                    ? "bg-gray-200 text-gray-500" 
                                                    : "bg-green-100 text-green-700"
                                                }`}>
                                                    {review.nama_pengirim.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{review.nama_pengirim}</h3>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(review.created_at).toLocaleDateString("id-ID", {
                                                            day: 'numeric', month: 'long', year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                {renderStars(review.rating)}
                                            </div>
                                        </div>
                                        
                                        <div className="bg-gray-50 p-4 rounded-xl rounded-tl-none">
                                            <p className="text-gray-700 italic">"{review.komentar}"</p>
                                        </div>
                                    </div>
                                </div>
                             )
                        })}
                    </div>
                )}
            </div>

            <div className="flex justify-center gap-2 mt-4">
                {reviews.slice(0, 5).map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                            idx === currentIndex ? "bg-green-600 w-6" : "bg-gray-300"
                        }`}
                    />
                ))}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}