const WA_LINK =
  "https://wa.me/6285162810074?text=Halo%20Admin%2C%20saya%20tertarik%20menggunakan%20layanan%20Qosama.%20Mohon%20informasi%20lebih%20lanjut.";

export default function Footer() {
  return (
    <footer
      id="kontak"
      className="bg-slate-950 text-slate-400 py-10 sm:py-16 px-4 sm:px-6"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
        {/* Brand */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white">
                dry_cleaning
              </span>
            </div>
            <span className="font-[var(--font-display)] text-2xl font-bold tracking-tight text-white">
              Qosa<span className="text-primary">ma.</span>
            </span>
          </div>
          <p className="leading-relaxed">
            Jasa premium cuci sepatu, tas, dan helm di Kota Semarang. Perawatan
            profesional untuk barang kesayangan Anda.
          </p>
          <div className="flex gap-4">
            <a
              href="https://instagram.com/qosama_clean"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">camera</span>
            </a>
            <a
              href="https://wa.me/6285162810074"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">call</span>
            </a>
            <a
              href="mailto:hello@qosama.com"
              className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">
                alternate_email
              </span>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-bold text-lg mb-4 sm:mb-8 uppercase tracking-wider">
            Menu
          </h4>
          <ul className="space-y-4">
            <li>
              <a
                className="hover:text-primary transition-colors"
                href="#tentang"
              >
                Tentang Kami
              </a>
            </li>
            <li>
              <a
                className="hover:text-primary transition-colors"
                href="#layanan"
              >
                Layanan Kami
              </a>
            </li>
            <li>
              <a
                className="hover:text-primary transition-colors"
                href="#proses"
              >
                Proses Kerja
              </a>
            </li>
            <li>
              <a
                className="hover:text-primary transition-colors"
                href="#kontak"
              >
                Kontak
              </a>
            </li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-white font-bold text-lg mb-4 sm:mb-8 uppercase tracking-wider">
            Layanan
          </h4>
          <ul className="space-y-4">
            <li>
              <a
                className="hover:text-primary transition-colors"
                href="https://wa.me/6285162810074?text=Halo%20Admin%2C%20saya%20tertarik%20menggunakan%20layanan%20cuci%20sepatu.%20Mohon%20informasi%20lebih%20lanjut."
                target="_blank"
                rel="noopener noreferrer"
              >
                Cuci Sepatu
              </a>
            </li>
            <li>
              <a
                className="hover:text-primary transition-colors"
                href="https://wa.me/6285162810074?text=Halo%20Admin%2C%20saya%20tertarik%20menggunakan%20layanan%20cuci%20helm.%20Mohon%20informasi%20lebih%20lanjut."
                target="_blank"
                rel="noopener noreferrer"
              >
                Cuci Helm
              </a>
            </li>
            <li>
              <a
                className="hover:text-primary transition-colors"
                href="https://wa.me/6285162810074?text=Halo%20Admin%2C%20saya%20tertarik%20menggunakan%20layanan%20cuci%20tas.%20Mohon%20informasi%20lebih%20lanjut."
                target="_blank"
                rel="noopener noreferrer"
              >
                Cuci Tas
              </a>
            </li>
            <li>
              <a
                className="hover:text-primary transition-colors"
                href="https://wa.me/6285162810074?text=Halo%20Admin%2C%20saya%20tertarik%20menggunakan%20layanan%20express.%20Mohon%20informasi%20lebih%20lanjut."
                target="_blank"
                rel="noopener noreferrer"
              >
                Express Delivery
              </a>
            </li>
          </ul>
        </div>

        {/* Location */}
        <div>
          <h4 className="text-white font-bold text-lg mb-4 sm:mb-8 uppercase tracking-wider">
            Lokasi
          </h4>
          <p className="mb-6 leading-relaxed">
            Jl Mataram, Jl. Kp. Rahayu Raya Jl. Mertojoyo No.118, Kota Semarang
          </p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors inline-block"
          >
            Hubungi Kami
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 mt-8 sm:pt-16 sm:mt-16 border-t border-slate-900 text-center text-sm">
        <p>© 2026 Qosama Professional Services. All rights reserved.</p>
      </div>
    </footer>
  );
}
