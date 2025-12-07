import React from "react";
import Link from 'next/link';
import MaintenanceGuard from "../MaintenanceGuard";

const Hero: React.FC = () => {
  return (
    <section className="relative bg-green-50 overflow-hidden min-h-[60vh] flex items-center">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <a 
              href="/user/informasi"
              className="group inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-green-600 hover:border-green-300 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-medium">Kembali ke Beranda</span>
            </a>
          </div>

          <div className="inline-block mb-4">
             <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded uppercase tracking-widest border border-green-200">
               Edukasi Lingkungan
             </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
            Mengenal Lebih Dekat <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-linear-to-r from-green-600 to-teal-500">
              Ekosistem Mangrove
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            Indonesia adalah rumah bagi <strong>23% mangrove dunia</strong>. 
            Pelajari bagaimana "Sabuk Hijau" ini melindungi pesisir kita dari abrasi, 
            menyerap karbon, dan menjadi rumah bagi ribuan biota laut.
          </p>
        </div>
      </div>
    </section>
  );
};

const Info: React.FC = () => {
  return (
    <section className="py-20 bg-white text-gray-800 border-b border-gray-100">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-green-600 font-bold tracking-widest text-sm uppercase mb-2 block">
            Ensiklopedia Alam
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Apa Sebenarnya Mangrove Itu?
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Mangrove (bakau) adalah vegetasi hutan yang tumbuh di antara garis pasang surut air laut, 
            tepatnya di daerah pantai dan sekitar muara sungai. Kelompok tumbuhan ini memiliki daya adaptasi luar biasa 
            terhadap lingkungan yang berkadar garam tinggi (<span className="italic text-green-700 font-semibold">halofita</span>).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto">

          <div className="bg-green-50 rounded-xl p-8 border border-green-100 flex items-start gap-4">
            <div className="text-3xl">📖</div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Asal Usul Kata</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Kata "Mangrove" dipercaya berasal dari kombinasi bahasa Portugis <strong>"Mangue"</strong> (tumbuhan bakau) dan bahasa Inggris <strong>"Grove"</strong> (semak belukar/hutan kecil).
              </p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-8 border border-blue-100 flex items-start gap-4">
            <div className="text-3xl">🌏</div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Habitat & Sebaran</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Hanya tumbuh di wilayah <strong>Tropis dan Subtropis</strong>. Indonesia memiliki hutan mangrove terluas di dunia (sekitar 3,3 juta hektar), mencakup 23% total mangrove global.
              </p>
            </div>
          </div>

        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Karakteristik Biologis</h3>
            <div className="w-16 h-1 bg-green-500 mx-auto rounded mt-2"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 transition-all text-center group">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 font-bold text-xl group-hover:bg-green-600 group-hover:text-white transition-colors">
                1
              </div>
              <h4 className="font-bold text-lg text-gray-800 mb-2">Adaptasi Garam</h4>
              <p className="text-sm text-gray-600">
                Memiliki kelenjar khusus untuk menyaring garam laut. Sebagian jenis membuang garam melalui daun tua yang digugurkan.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 transition-all text-center group">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 font-bold text-xl group-hover:bg-green-600 group-hover:text-white transition-colors">
                2
              </div>
              <h4 className="font-bold text-lg text-gray-800 mb-2">Akar Napas</h4>
              <p className="text-sm text-gray-600">
                Tanah lumpur miskin oksigen membuat akar mangrove mencuat ke atas (Pneumatofora) untuk bernapas langsung dari udara.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 transition-all text-center group">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 font-bold text-xl group-hover:bg-green-600 group-hover:text-white transition-colors">
                3
              </div>
              <h4 className="font-bold text-lg text-gray-800 mb-2">Buah Vivipar</h4>
              <p className="text-sm text-gray-600">
                Biji berkecambah saat masih menempel di pohon induk. Saat jatuh, mereka sudah siap tumbuh di lumpur (propagul).
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Jenis: React.FC = () => {
  const dataJenis = [
    {
      nama: "Rhizophora",
      lokal: "Bakau",
      deskripsi: "Sering disalahartikan sebagai nama umum mangrove. Hidup di zona pasang surut tengah. Kulit batangnya sering digunakan untuk pewarna alami.",
      ciri: "Akar Tunjang (Stilt Root)"
    },
    {
      nama: "Avicennia",
      lokal: "Api-api",
      deskripsi: "Pionir di pantai berlumpur. Daunnya memiliki kelenjar garam di bagian bawah. Kayunya sering digunakan sebagai kayu bakar.",
      ciri: "Akar Napas (Pencil Root)"
    },
    {
      nama: "Sonneratia",
      lokal: "Pidada / Bogem",
      deskripsi: "Buahnya bulat pipih dan dapat dimakan (dibuat sirup/dodol). Bunga mekar di malam hari dan diserbuki oleh kelelawar.",
      ciri: "Akar Kerucut (Cone Root)"
    },
    {
      nama: "Bruguiera",
      lokal: "Lindur / Tanjang",
      deskripsi: "Tumbuh di belakang zona Avicennia/Rhizophora. Daunnya tebal dan lancip. Buahnya (propaguls) berbentuk seperti cerutu atau rokok.",
      ciri: "Akar Lutut (Knee Root)"
    },
    {
      nama: "Nypa fruticans",
      lokal: "Nipah",
      deskripsi: "Satu-satunya mangrove bentuk palem. Daunnya sering dipakai untuk atap rumah tradisional. Buahnya enak dimakan (kolang-kaling air).",
      ciri: "Tanpa Batang Kayu"
    },
    {
      nama: "Ceriops",
      lokal: "Tengar",
      deskripsi: "Mirip Rhizophora tapi lebih kecil. Sering tumbuh di area tanah yang lebih kering atau liat. Kulit kayunya kaya akan tanin.",
      ciri: "Akar Banir (Buttress)"
    },
    {
      nama: "Xylocarpus",
      lokal: "Nyirih",
      deskripsi: "Dikenal sebagai 'Mangrove Jambu' karena buahnya bulat besar mirip bola meriam (Cannonball). Kayunya sangat keras dan indah untuk furnitur.",
      ciri: "Akar Papan Melebar"
    },
    {
      nama: "Aegiceras",
      lokal: "Kaboa / Gigi Gajah",
      deskripsi: "Mangrove semak atau pohon kecil. Bunganya putih kecil wangi dan buahnya melengkung runcing seperti taring atau tanduk.",
      ciri: "Sekresi Garam di Daun"
    }
  ];

  return (
    <section className=" bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800">Jenis Mangrove</h2>
          <p className="mt-3 text-gray-600">
            Indonesia memiliki keanekaragaman mangrove tertinggi di dunia. Berikut adalah 
            klasifikasi jenis-jenis utama yang menyusun ekosistem pesisir kita.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dataJenis.map((item, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
            >

              <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-green-400 to-green-600"></div>

              <div className="mb-4">
                <span className="text-xs font-bold tracking-wider text-green-600 uppercase bg-green-50 px-2 py-1 rounded-md">
                   {item.ciri}
                </span>
                <div className="flex items-baseline gap-2 mt-3">
                    <h3 className="text-xl font-bold text-gray-900">{item.lokal}</h3>
                    <span className="text-sm text-gray-500 italic font-serif">({item.nama})</span>
                </div>
              </div>

              <hr className="border-gray-100 mb-4" />

              <p className="text-gray-600 text-sm leading-relaxed">
                {item.deskripsi}
              </p>

              <div className="absolute -bottom-4 -right-4 opacity-5 pointer-events-none">
                 <svg className="w-24 h-24 text-green-800" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/>
                 </svg>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
            <p className="text-sm text-gray-500 bg-white inline-block px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                🌿 Masih banyak jenis lain seperti <em>Lumnitzera</em> (Teruntum), <em>Excoecaria</em> (Buta-buta), dan <em>Scyphiphora</em>.
            </p>
        </div>
      </div>
    </section>
  );
};

const Manfaat: React.FC = () => {
  const dataManfaat = [
    {
      judul: "Perisai Pesisir (Mencegah Abrasi)",
      deskripsi: "Akar mangrove yang kuat mencengkeram tanah lumpur, menahan kikisan ombak, dan meredam energi gelombang besar hingga tsunami agar tidak merusak daratan.",
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      judul: "Habitat Satwa (Nursery Ground)",
      deskripsi: "Tempat pemijahan (bertelur) bagi ikan, udang, dan kepiting. Jika mangrove hilang, populasi ikan di laut lepas juga akan menurun drastis.",
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      judul: "Penyerap Karbon (Blue Carbon)",
      deskripsi: "Mangrove mampu menyerap dan menyimpan karbon 3 hingga 5 kali lebih banyak dibandingkan hutan tropis biasa, menjadikannya solusi vital perubahan iklim.",
      icon: (
        <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Kenapa Mangrove Penting?</h2>
          <p className="mt-2 text-gray-600">3 fungsi utama ekosistem mangrove bagi kehidupan kita.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {dataManfaat.map((item, index) => (
            <div key={index} className="bg-white p-8 rounded-xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden group">

              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-green-400 to-blue-500"></div>

              <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-50 transition-colors duration-300">
                {item.icon}
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-3">{item.judul}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {item.deskripsi}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

const Fauna: React.FC = () => {
  const dataFauna = [
    {
      kategori: "Mamalia",
      nama: "Bekantan (Proboscis Monkey)",
      desc: "Primata endemik Kalimantan dengan ciri khas hidung besar. Mereka perenang ulung dan menjadikan pohon mangrove tinggi sebagai tempat tidur aman.",
      icon: "🐒"
    },
    {
      kategori: "Pisces (Ikan)",
      nama: "Ikan Gelodok (Mudskipper)",
      desc: "Ikan unik yang bisa 'berjalan' di atas lumpur menggunakan siripnya. Mereka bisa bernapas di darat selama kulitnya basah.",
      icon: "🐟"
    },
    {
      kategori: "Aves (Burung)",
      nama: "Burung Kuntul (Egret)",
      desc: "Burung migran berwarna putih yang mencari makan di sela-sela akar. Kehadirannya menandakan ekosistem mangrove masih sehat dan banyak ikan.",
      icon: "🐦"
    },
    {
      kategori: "Crustacea",
      nama: "Kepiting Bakau (Scylla)",
      desc: "Penghuni liang di sela akar. Bernilai ekonomi tinggi. Mereka membantu aerasi tanah (pertukaran udara) melalui lubang yang mereka gali.",
      icon: "🦀"
    },
    {
      kategori: "Reptil",
      nama: "Biawak Air",
      desc: "Sering terlihat berjemur di dahan atau berenang mencari mangsa. Merupakan predator alami pengendali populasi hewan kecil.",
      icon: "🦎"
    },
    {
      kategori: "Invertebrata",
      nama: "Udang Pistol",
      desc: "Memiliki capit yang bisa menembakkan gelombang kejut berbunyi keras ('klik') untuk memingsankan mangsa di perairan keruh.",
      icon: "🦐"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        
        <div className="mb-12 text-center">
          <span className="text-blue-600 font-bold tracking-wider text-sm uppercase">Penghuni Ekosistem</span>
          <h2 className="text-3xl font-bold text-gray-900 mt-2">Fauna Unik Mangrove</h2>
          <p className="mt-2 text-gray-600">Hutan mangrove adalah rumah bagi satwa yang telah beradaptasi dengan pasang surut air laut.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dataFauna.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:bg-white hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl bg-white w-14 h-14 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  {item.kategori}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.nama}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

const Produk: React.FC = () => {
  const dataProduk = [
    {
      nama: "Sirup Pidada",
      bahan: "Buah Sonneratia (Pidada)",
      desc: "Minuman segar kaya Vitamin C yang diolah dari sari buah Pidada. Rasanya manis asam menyegarkan, sering dijadikan oleh-oleh khas pesisir.",
      manfaat: "Kaya Vitamin C"
    },
    {
      nama: "Batik Mangrove",
      bahan: "Kulit Kayu & Daun",
      desc: "Kain batik yang menggunakan pewarna alami dari limbah kulit kayu mangrove (seperti Rhizophora) yang jatuh, menghasilkan warna coklat/kemerahan yang khas.",
      manfaat: "Ramah Lingkungan"
    },
    {
      nama: "Dodol Mangrove",
      bahan: "Buah Avicennia/Sonneratia",
      desc: "Camilan manis legit. Daging buah mangrove dihaluskan dan dimasak dengan gula kelapa. Alternatif pangan lokal yang lezat.",
      manfaat: "Pangan Lokal"
    },
    {
      nama: "Keripik Daun",
      bahan: "Daun Jeruju (Acanthus)",
      desc: "Daun muda spesies Jeruju yang telah dibuang durinya, digoreng dengan tepung bumbu. Rasanya gurih dan renyah seperti keripik bayam.",
      manfaat: "Antioksidan"
    }
  ];

  return (
    <section className="py-16 bg-green-50/50">
      <div className="container mx-auto px-4">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4 border-b border-green-200 pb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Potensi Ekonomi</h2>
            <p className="mt-2 text-gray-600 max-w-2xl">
              Mangrove tidak hanya kayu. Masyarakat pesisir mengolah hasil hutan bukan kayu menjadi produk bernilai tinggi tanpa merusak pohon.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dataProduk.map((item, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border-t-4 border-green-500">

              <div className="mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Bahan Baku:</p>
                <p className="text-sm font-medium text-green-700">{item.bahan}</p>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">{item.nama}</h3>

              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                {item.desc}
              </p>

              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-xs font-bold text-gray-500 uppercase">{item.manfaat}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 p-4 bg-yellow-50 rounded-lg border border-yellow-100 flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <p className="text-sm text-yellow-800">
                <strong>Tahukah Anda?</strong> Dengan membeli produk olahan mangrove, Anda membantu ekonomi masyarakat pesisir sekaligus mendukung mereka untuk terus menjaga kelestarian hutannya.
            </p>
        </div>

      </div>
    </section>
  );
};

const ManfaatSection = () => {
  // Data Diperlengkap jadi 8 Poin (Agar pas 4 Kolom)
  const benefitList = [
    {
      title: "Perisai Abrasi",
      desc: "Akar tunjang yang kokoh menahan tanah lumpur agar tidak tergerus ombak, menjaga garis pantai tetap stabil.",
      icon: "🛡️"
    },
    {
      title: "Peredam Tsunami",
      desc: "Hutan mangrove yang tebal dapat meredam energi gelombang besar dan tsunami hingga 50%, melindungi pemukiman.",
      icon: "🌊"
    },
    {
      title: "Penyerap Racun",
      desc: "Berfungsi sebagai biofilter yang menyerap limbah logam berat dan pestisida sebelum air sungai masuk ke laut.",
      icon: "💧"
    },
    {
      title: "Gudang Karbon",
      desc: "Menyimpan karbon (Blue Carbon) di dalam tanah 4x lebih banyak dari hutan tropis biasa, solusi krisis iklim.",
      icon: "🌍"
    },
    {
      title: "Nursery Ground",
      desc: "Tempat 80% ikan, udang, dan kepiting pesisir bertelur dan membesar. Kunci keberlangsungan stok ikan laut.",
      icon: "🦐"
    },
    {
      title: "Habitat Satwa",
      desc: "Rumah bagi satwa endemik (Bekantan, Kucing Bakau) dan tempat istirahat burung migran antar benua.",
      icon: "🦅"
    },
    {
      title: "Ekowisata",
      desc: "Menawarkan keindahan alam yang menenangkan, menjadi destinasi wisata edukasi yang menggerakkan ekonomi desa.",
      icon: "📸"
    },
    {
      title: "Produk Olahan",
      desc: "Buah mangrove (Pidada) bisa jadi sirup & dodol. Daun Jeruju jadi keripik. Batang kering jadi kerajinan/batik.",
      icon: "💰"
    }
  ];

  return (
    <section className="relative bg-white overflow-hidden py-16 font-sans">
      
      {/* Background Statis (Tanpa Animasi) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-green-100 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-0 w-80 h-80 bg-blue-50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-teal-50 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        
        {/* Header Compact */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
            Fungsi & Nilai Ekosistem
          </h2>
          <p className="text-gray-500 leading-relaxed text-sm md:text-base">
            Mangrove adalah infrastruktur alami yang vital. Keberadaannya menjamin keamanan pesisir, 
            kualitas air, dan keberlanjutan ekonomi masyarakat sekitar.
          </p>
        </div>

        {/* Grid 4 Kolom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {benefitList.map((item, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:border-green-400 hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-xl">
                    {item.icon}
                  </div>
                  {/* Garis Hiasan Kecil */}
                  <div className="h-1 w-8 bg-gray-100 rounded-full"></div>
                </div>
                
                <h3 className="text-base font-bold text-gray-800 mb-2">
                  {item.title}
                </h3>
                
                <p className="text-xs text-gray-500 leading-relaxed grow">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Stats Simple */}
        <div className="mt-12 pt-8 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
           <div>
             <span className="block text-2xl font-bold text-gray-900">3,3 Juta</span>
             <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Hektar Luas Lahan</span>
           </div>
           <div>
             <span className="block text-2xl font-bold text-gray-900">23%</span>
             <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Total Dunia</span>
           </div>
           <div>
             <span className="block text-2xl font-bold text-gray-900">1.500+</span>
             <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Desa Pesisir</span>
           </div>
           <div>
             <span className="block text-2xl font-bold text-gray-900">5x</span>
             <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Lipat Simpan Karbon</span>
           </div>
        </div>

      </div>
    </section>
  );
};

const CaraMenanamSection = () => {
  // Data Langkah-Langkah (SOP Penanaman)
  const plantingSteps = [
    {
      step: "01",
      title: "Survey Lokasi",
      desc: "Pastikan lokasi sesuai dengan jenis mangrove. Rhizophora cocok di tanah berlumpur dalam, sedangkan Avicennia di lumpur berpasir.",
      icon: "📍"
    },
    {
      step: "02",
      title: "Persiapan Bibit",
      desc: "Pilih propagul (buah) yang sudah tua/matang (cincin kotiledon kuning/coklat) dan bebas dari hama penyakit.",
      icon: "🌱"
    },
    {
      step: "03",
      title: "Pemasangan Ajir",
      desc: "Tancapkan batang bambu (ajir) sedalam 50cm sebagai penyangga agar bibit tidak hanyut terbawa ombak pasang.",
      icon: "🎋"
    },
    {
      step: "04",
      title: "Atur Jarak Tanam",
      desc: "Gunakan pola tanam rumpun berjarak. Jarak ideal biasanya 1x1 meter atau 2x2 meter tergantung kepadatan yang diinginkan.",
      icon: "📏"
    },
    {
      step: "05",
      title: "Proses Tanam",
      desc: "Tancapkan 1/3 bagian propagul ke dalam lumpur di samping ajir. Pastikan posisi tegak lurus dan tidak terbalik.",
      icon: "👇"
    },
    {
      step: "06",
      title: "Pengikatan",
      desc: "Ikat bibit pada ajir menggunakan tali ramah lingkungan (tali ijuk/katun). Ikat longgar (angka 8) agar batang bisa membesar.",
      icon: "🧶"
    },
    {
      step: "07",
      title: "Penyulaman",
      desc: "Cek rutin di bulan pertama. Jika ada bibit yang mati atau hanyut, segera ganti dengan bibit baru agar tumbuh seragam.",
      icon: "🔄"
    },
    {
      step: "08",
      title: "Pembersihan",
      desc: "Rutin bersihkan sampah plastik yang menyangkut di bibit muda dan hilangkan hama teritip yang menempel pada batang.",
      icon: "🧹"
    }
  ];

  return (
    <section className="relative bg-white overflow-hidden py-16 font-sans">
      
      {/* Background Statis */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-10 left-10 w-80 h-80 bg-green-50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-50 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        
        {/* Header Compact */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
            Panduan Menanam Mangrove
          </h2>
          <p className="text-gray-500 leading-relaxed text-sm md:text-base">
            Rehabilitasi pesisir membutuhkan teknik yang tepat agar tingkat kelulushidupan (survival rate) tinggi. 
            Ikuti langkah standar operasional berikut ini.
          </p>
        </div>

        {/* Grid 4 Kolom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {plantingSteps.map((item, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:border-green-400 hover:shadow-md transition-all duration-200 group relative overflow-hidden"
            >
              {/* Nomor Step Besar Transparan */}
              <div className="absolute -right-4 -top-4 text-6xl font-bold text-gray-50 group-hover:text-green-50 transition-colors select-none">
                {item.step}
              </div>

              <div className="flex flex-col h-full relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-xl group-hover:bg-green-50 transition-colors">
                    {item.icon}
                  </div>
                  {/* Indikator Garis */}
                  <div className="h-1 w-8 bg-gray-100 rounded-full group-hover:bg-green-200 transition-colors"></div>
                </div>
                
                <h3 className="text-base font-bold text-gray-800 mb-2">
                  {item.title}
                </h3>
                
                <p className="text-xs text-gray-500 leading-relaxed grow">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box Tambahan */}
        <div className="mt-12 bg-yellow-50 border border-yellow-100 rounded-lg p-6 flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
           <div className="text-3xl">💡</div>
           <div>
             <h4 className="text-sm font-bold text-yellow-800 uppercase tracking-wide">Tips Keberhasilan</h4>
             <p className="text-xs md:text-sm text-yellow-700 mt-1">
               Waktu tanam terbaik adalah saat <strong>air surut terendah</strong> di pagi atau sore hari. Hindari menanam saat musim ombak besar (Barat) untuk mencegah bibit muda tercabut.
             </p>
           </div>
        </div>

      </div>
    </section>
  );
};

const MitosFaktaSection = () => {
  // Data Fakta vs Mitos (Global & Lokal)
  const factsList = [
    {
      mitos: "Mangrove adalah sarang nyamuk dan sumber penyakit malaria.",
      fakta: "Ekosistem mangrove yang sehat memiliki predator alami (ikan, capung, laba-laba) yang memakan jentik nyamuk, sehingga populasi nyamuk terkendali secara alami.",
      icon: "🦟"
    },
    {
      mitos: "Hutan hujan (Rainforest) adalah penyerap karbon terbesar.",
      fakta: "Mangrove menyimpan karbon (Blue Carbon) 3 hingga 5 kali lebih banyak per hektar dibandingkan hutan hujan tropis di daratan.",
      icon: "🌳"
    },
    {
      mitos: "Semua jenis mangrove bisa ditanam di mana saja di pantai.",
      fakta: "Setiap jenis memiliki zonasi khusus. Rhizophora butuh lumpur dalam, Avicennia butuh pasir berlumpur. Salah zonasi menyebabkan kematian bibit (salah tanam).",
      icon: "📍"
    },
    {
      mitos: "Mangrove hanya semak belukar yang kotor dan bau.",
      fakta: "Bau khas (seperti telur busuk) berasal dari bakteri pengurai di lumpur yang vital untuk nutrisi laut. Ini tanda ekosistem sedang bekerja menyuburkan laut.",
      icon: "👃"
    },
    {
      mitos: "Mangrove tidak bisa menahan Tsunami besar.",
      fakta: "Riset pasca-tsunami Aceh 2004 membuktikan sabuk mangrove selebar 100m dapat mereduksi ketinggian dan energi gelombang tsunami hingga 50-90%.",
      icon: "🌊"
    },
    {
      mitos: "Menebang mangrove lebih menguntungkan untuk tambak.",
      fakta: "Tanpa mangrove, tambak rentan terkena abrasi, penyakit ikan, dan kualitas air buruk. Tambak 'Silvofishery' (gabungan mangrove) terbukti lebih lestari.",
      icon: "💰"
    },
    {
      mitos: "Indonesia hanya memiliki sedikit spesies mangrove.",
      fakta: "Indonesia adalah pusat keanekaragaman mangrove dunia (World's Mangrove Center) dengan 40+ spesies sejati, terbanyak dibandingkan negara manapun.",
      icon: "🇮🇩"
    },
    {
      mitos: "Tanah lumpur mangrove tidak stabil untuk bangunan.",
      fakta: "Akar mangrove justru mengikat sedimen dan memperkeras tanah (akresi). Tanpa mangrove, tanah pesisir justru akan hilang tergerus laut.",
      icon: "🏗️"
    }
  ];

  return (
    <section className="relative bg-white overflow-hidden py-16 font-sans">
      
      {/* Background Statis */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-20 right-20 w-96 h-96 bg-red-50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-green-50 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        
        {/* Header Compact */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
            Fakta vs Mitos
          </h2>
          <p className="text-gray-500 leading-relaxed text-sm md:text-base">
            Banyak kesalahpahaman tentang ekosistem pesisir. Mari luruskan informasi 
            berdasarkan sains dan data lapangan agar upaya konservasi lebih tepat sasaran.
          </p>
        </div>

        {/* Grid 4 Kolom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {factsList.map((item, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
            >
              <div className="mb-4">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-xl mb-3">
                  {item.icon}
                </div>
                
                {/* Bagian Mitos */}
                <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded uppercase tracking-wider">
                  Mitos
                </span>
                <p className="text-sm font-medium text-gray-800 mt-2 leading-snug">
                  "{item.mitos}"
                </p>
              </div>

              {/* Garis Pemisah Putus-putus */}
              <div className="border-t border-dashed border-gray-200 my-2 grow"></div>

              {/* Bagian Fakta */}
              <div className="mt-2">
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded uppercase tracking-wider">
                  Fakta
                </span>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  {item.fakta}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box Validasi */}
        <div className="mt-12 bg-blue-50 border border-blue-100 rounded-lg p-6 flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
           <div className="text-3xl">🌏</div>
           <div>
             <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wide">Fakta Global</h4>
             <p className="text-xs md:text-sm text-blue-700 mt-1">
               Menurut data <em>Global Mangrove Alliance</em>, jika kita kehilangan seluruh mangrove hari ini, 
               kerugian ekonomi global diperkirakan mencapai <strong>$65 Miliar per tahun</strong> akibat hilangnya perlindungan badai dan perikanan.
             </p>
           </div>
        </div>

      </div>
    </section>
  );
};

const Ancaman: React.FC = () => {
  const dataAncaman = [
    {
      judul: "Alih Fungsi Lahan",
      desc: "Ancaman terbesar saat ini. Hutan mangrove sering ditebang habis untuk diubah menjadi tambak udang/ikan, perkebunan kelapa sawit, atau pemukiman.",
      icon: "🏗️"
    },
    {
      judul: "Sampah Plastik",
      desc: "Akar mangrove sering terjerat sampah plastik dari laut maupun sungai. Ini menutupi akar napas, membuat pohon mati lemas karena tidak bisa mengambil oksigen.",
      icon: "🗑️"
    },
    {
      judul: "Penebangan Liar",
      desc: "Penebangan kayu bakau untuk dijadikan arang (charcoal) atau bahan bangunan tanpa sistem tebang-pilih yang lestari.",
      icon: "🪓"
    },
    {
      judul: "Pencemaran Minyak",
      desc: "Tumpahan minyak di laut sangat mematikan bagi mangrove karena minyak menutup pori-pori akar dan meracuni jaringan tanaman.",
      icon: "🛢️"
    }
  ];

  return (
    <section className="py-16 bg-orange-50/50">
      <div className="container mx-auto px-4">

        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-orange-200 pb-6">
          <div className="max-w-2xl">
            <span className="text-orange-600 font-bold tracking-wider text-sm uppercase">Tantangan Konservasi</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Mengapa Mangrove Terancam Punah?</h2>
            <p className="mt-2 text-gray-600">
              Meskipun manfaatnya besar, luas hutan mangrove terus menyusut akibat aktivitas manusia.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dataAncaman.map((item, index) => (
            <div key={index} className="flex items-start bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-orange-200 transition-colors">
              <div className="shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-2xl mr-4">
                {item.icon}
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{item.judul}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white border-l-4 border-red-500 p-6 rounded-r-lg shadow-sm flex items-start gap-4">
            <div className="text-red-500 text-xl mt-1">⚠️</div>
            <div>
                <h4 className="font-bold text-gray-800">Fakta Kritis</h4>
                <p className="text-gray-600 text-sm mt-1">
                    Indonesia kehilangan ribuan hektar mangrove setiap tahunnya. Jika tidak dijaga, kita akan kehilangan pelindung alami dari bencana tsunami dan abrasi.
                </p>
            </div>
        </div>
      </div>
    </section>
  );
};

export default function EdukasiMangrove() {
return (
<div className="min-h-screen w-full bg-gray-100 text-gray-900">
<Hero />
<Info />
<Jenis />
<Manfaat />
<Fauna />
<Produk />
<ManfaatSection />
<CaraMenanamSection />
<MitosFaktaSection />
<Ancaman />
</div>
);
}