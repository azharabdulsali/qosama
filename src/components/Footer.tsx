import Image from "next/image";
import { Mail } from "lucide-react";

const WA_LINK =
  "https://wa.me/6285162810074?text=Halo%20Admin%2C%20saya%20tertarik%20menggunakan%20layanan%20Qosama.%20Mohon%20informasi%20lebih%20lanjut.";

function SocialBtn({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-all duration-200 hover:scale-110 hover:bg-primary hover:text-white"
    >
      {children}
    </a>
  );
}

export default function Footer() {
  return (
    <footer id="kontak" className="bg-slate-950 text-slate-400">
      {/* ── ZONA 1: Brand · Layanan · Lokasi ── */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 md:grid-cols-3 md:gap-12">

          {/* Column 1 — Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary">
                <Image
                  src="/icon.png"
                  alt="Qosama Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="font-[var(--font-display)] text-2xl font-bold tracking-tight text-white">
                Qosa<span className="text-primary">ma.</span>
              </span>
            </div>

            <p className="text-sm leading-relaxed">
              Jasa pencucian sepatu, tas, dan helm di Kota Semarang. Perawatan
              terbaik untuk barang kesayangan Anda.
            </p>

            <div className="flex gap-3">
              <SocialBtn href="https://instagram.com/qosama_clean" label="Instagram Qosama">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </SocialBtn>

              <SocialBtn href="https://wa.me/6285162810074" label="WhatsApp Qosama">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </SocialBtn>

              <a
                href="mailto:hello@qosama.com"
                aria-label="Email Qosama"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-all duration-200 hover:scale-110 hover:bg-primary hover:text-white"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 2 — Layanan */}
          <div>
            <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-white">
              Layanan
            </h4>
            <ul className="space-y-3.5 text-sm">
              {[
                {
                  label: "Cuci Sepatu",
                  href: "https://wa.me/6285162810074?text=Halo%20Admin%2C%20saya%20tertarik%20menggunakan%20layanan%20cuci%20sepatu.%20Mohon%20informasi%20lebih%20lanjut.",
                },
                {
                  label: "Cuci Helm",
                  href: "https://wa.me/6285162810074?text=Halo%20Admin%2C%20saya%20tertarik%20menggunakan%20layanan%20cuci%20helm.%20Mohon%20informasi%20lebih%20lanjut.",
                },
                {
                  label: "Cuci Tas",
                  href: "https://wa.me/6285162810074?text=Halo%20Admin%2C%20saya%20tertarik%20menggunakan%20layanan%20cuci%20tas.%20Mohon%20informasi%20lebih%20lanjut.",
                },
                {
                  label: "Express Delivery",
                  href: "https://wa.me/6285162810074?text=Halo%20Admin%2C%20saya%20tertarik%20menggunakan%20layanan%20express.%20Mohon%20informasi%20lebih%20lanjut.",
                },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 transition-colors hover:text-primary"
                  >
                    <span className="h-px w-3 flex-shrink-0 bg-slate-700 transition-all duration-200 group-hover:w-5 group-hover:bg-primary" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Lokasi + Map */}
          <div className="space-y-4 sm:col-span-2 md:col-span-1">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              Lokasi
            </h4>

            {/* Map embed */}
            <div className="overflow-hidden rounded-2xl border border-slate-800 shadow-lg">
              <iframe
                src="https://maps.google.com/maps?q=Qosama+clean+-6.9919729,110.4322955&z=19&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="200"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi Qosama Clean - Semarang"
              />
            </div>

            {/* Address */}
            <div className="flex items-start gap-2.5 text-sm">
              <svg viewBox="0 0 24 24" fill="currentColor" className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.327a8 8 0 10-16 0c0 3.63 1.556 6.326 3.5 8.327a19.583 19.583 0 002.682 2.282 16.975 16.975 0 001.144.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <p className="leading-relaxed">
                Jl. Mertojoyo No.118, Kota Semarang, Jawa Tengah
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2 xs:flex-row xs:flex-wrap">
              <a
                href="https://www.google.com/maps/place/Qosama+clean/@-6.9924534,110.4328045,19z"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-300 transition-all hover:border-primary hover:text-primary xs:w-auto"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.327a8 8 0 10-16 0c0 3.63 1.556 6.326 3.5 8.327a19.583 19.583 0 002.682 2.282 16.975 16.975 0 001.144.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Buka Maps
              </a>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-blue-700 xs:w-auto"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Hubungi Kami
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* ── ZONA 2: Copyright ── */}
      <div className="border-t border-slate-800/60">
        <div className="mx-auto max-w-7xl px-4 py-5 text-center text-xs sm:px-6 sm:text-sm">
          <p>© 2026 Qosama Professional Services. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
