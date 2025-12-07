"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Leaf, MapPin, BookOpen, ArrowRight, Sprout } from "lucide-react";

const FadeUp = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F3F9F5] text-green-900 font-sans selection:bg-green-200 overflow-hidden">
      <section className="relative pt-20 pb-16 px-6 lg:pt-32">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight text-green-950 mb-6">
              Jelajahi, Pelajari, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600">
                Lestarikan Alam.
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
              Platform Eduwisata Mangrove terintegrasi. Pesan tiket, pelajari ekosistem, dan bergabung dalam aksi penanaman pohon hanya dalam satu aplikasi.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/user/register" className="px-8 py-4 bg-green-700 hover:bg-green-800 text-white rounded-full font-semibold shadow-lg hover:shadow-green-200/50 transition flex items-center gap-2">
                Daftar Sekarang <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="user/login" className="px-8 py-4 bg-white border border-green-200 text-green-700 hover:bg-green-50 rounded-full font-semibold transition">
                Masuk Akun
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-md aspect-square bg-gradient-to-bl from-green-600 to-teal-800 rounded-[3rem] shadow-2xl flex items-center justify-center p-8 overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -mr-20 -mt-20"></div>
               <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-xl -ml-10 -mb-10"></div>
               
               <div className="text-center text-white z-10">
                 <Leaf className="w-24 h-24 mx-auto mb-4 text-green-200 opacity-90" />
                 <h2 className="text-3xl font-bold">Mangrove Sepuluh</h2>
                 <p className="mt-2 text-green-100 opacity-80">Bangkalan, Jawa Timur</p>
               </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}