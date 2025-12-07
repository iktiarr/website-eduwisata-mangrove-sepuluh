"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function KasirLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menus = [
    { 
      name: "🏠 Dashboard", 
      path: "/dashboard/kasir"
    },
    { 
      name: "🌐 Histori Online", 
      path: "/dashboard/kasir/menu_histori_online" 
    },
    { 
      name: "🧾 Histori Offline", 
      path: "/dashboard/kasir/menu_histori_offline" 
    },
    { 
      name: "🎫 Jenis Tiket", 
      path: "/dashboard/kasir/menu_jenis_tiket" 
    },
    { 
      name: "💰 Laporan Penghasilan", 
      path: "/dashboard/kasir/menu_penghasilan" 
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800 overflow-hidden">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 transition-all duration-300">
        <div className="h-16 flex items-center justify-center border-b border-gray-100 bg-green-600">
          <h1 className="text-xl font-bold text-white tracking-wide">KASIR MANGROVE</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menus.map((menu) => {
            const isActive = pathname === menu.path;
            return (
              <Link
                key={menu.path}
                href={menu.path}
                className={`flex items-center w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? "bg-green-100 text-green-700 shadow-sm translate-x-1" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {menu.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Link 
            href="/dashboard" 
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
          >
            Keluar
          </Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
           {children} 
        </div>

      </main>

    </div>
  );
}