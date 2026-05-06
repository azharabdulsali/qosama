"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RewardsDashboard from "@/components/RewardsDashboard";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

const WA_LINK =
  "https://wa.me/6285162810074?text=Halo%20Admin%2C%20saya%20tertarik%20menggunakan%20layanan%20Qosama.%20Mohon%20informasi%20lebih%20lanjut.";

const WA_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function Home() {
  return (
    <main
      id="beranda"
      className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-[var(--font-body)] transition-colors duration-300"
    >
      <Navbar />

      {/* ====== HERO / BUSINESS PROFILE SECTION ====== */}
      <section
        id="tentang"
        className="overflow-hidden bg-pattern px-4 py-12 sm:px-6 sm:py-20 lg:py-28"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
            {/* Left: Image */}
            <div className="relative pb-12 sm:pb-0">
              <div className="relative z-10 h-[220px] overflow-hidden rounded-2xl shadow-2xl xs:h-[260px] sm:h-[420px] sm:rounded-3xl lg:h-[580px]">
                <Image
                  alt="Qosama professional cleaning service"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7ki6Y1lSYOkEOohiUAcmO0FfGXAWRdKg5PsUxjgxRHqQenndDHV-VcIrVzM0CmUsEQN_ECGD1ZkFP3pFb6dKYXZZ5R6SFmpn_hUfT2duOBCDCahgE2uCYMq_ABF76_1JnNxZ3kqA6XoyjlHzoCsVyjdUceUctMAhwNohjlgPrkI0KtRxdv0R0mxIWvujSp1erYRkcz3ZOAs2PIVwFiB9gRs8bxL6HjIxgUf6P_lkAm5f5yzUojvQLeSrTS1c8PWfo4mgNkwn189g"
                  fill
                  sizes="(min-width: 1024px) 608px, calc(100vw - 32px)"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  priority
                />
                {/* Overlay shimmer */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
              </div>
              {/* Floating stat badge */}
              <div className="absolute bottom-0 right-2 z-20 max-w-[160px] translate-y-1/4 rounded-xl bg-primary p-3 text-white shadow-2xl shadow-primary/30 xs:max-w-[190px] xs:p-4 sm:-bottom-10 sm:-right-4 sm:max-w-xs sm:translate-y-0 sm:rounded-2xl sm:p-6 lg:-right-10 lg:p-8">
                <div className="mb-1 font-[var(--font-display)] text-2xl font-bold xs:text-3xl sm:text-4xl lg:text-5xl">
                  100+
                </div>
                <div className="text-sm font-medium opacity-90 sm:text-base">
                  Pengalaman Pencucian
                </div>
              </div>
              {/* Decorative blobs */}
              <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-secondary blur-3xl opacity-20" />
              <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-primary blur-2xl opacity-10" />
            </div>

            {/* Right: Text */}
            <div className="space-y-6 sm:space-y-8">
              <div>
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary sm:px-4 sm:text-sm">
                  Qosama Clean
                </span>
                <h1 className="mb-4 font-[var(--font-display)] text-3xl font-extrabold leading-tight sm:mb-6 sm:text-4xl lg:text-5xl">
                  Kami Menyediakan Layanan{" "}
                  <span className="text-primary">Perawatan</span> untuk Sepatu,
                  Tas dan Helm Anda
                </h1>
                <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg">
                  Qosama adalah solusi perawatan di Kota Semarang. Baik itu
                  sepatu kesayangan, tas, maupun helm harian. Kami menangani
                  setiap item dengan teknik khusus untuk hasil maksimal.
                </p>
              </div>

              {/* Quick highlights */}
              {/* <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { icon: "👟", label: "Cuci Sepatu" },
                  { icon: "🎒", label: "Cuci Tas" },
                  { icon: "🪖", label: "Cuci Helm" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2.5 text-sm font-semibold shadow-sm dark:border-slate-700 dark:bg-slate-800"
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </div>
                ))}
              </div> */}

              <div className="flex flex-col gap-3 xs:flex-row xs:flex-wrap">
                <a
                  href="#layanan"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:bg-blue-800 xs:w-auto sm:px-8 sm:py-4"
                >
                  Selengkapnya
                  <ChevronRight className="h-5 w-5" />
                </a>
                <a
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 font-bold text-slate-900 shadow-sm transition-all hover:scale-105 hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white xs:w-auto sm:px-8 sm:py-4"
                >
                  {WA_ICON}
                  Hubungi Kami
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== REWARDS LEADERBOARD ====== */}
      <RewardsDashboard />

      {/* ====== WHY CHOOSE US SECTION ====== */}
      <section
        id="layanan"
        className="bg-slate-50 px-4 py-14 dark:bg-slate-900 sm:px-6 sm:py-20 lg:py-28"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid items-center gap-10 sm:gap-14 lg:grid-cols-2 lg:gap-20">
            {/* Left: Text */}
            <div className="order-2 lg:order-1">
              <span className="text-xs font-bold uppercase tracking-widest text-primary sm:text-sm">
                Mengapa Cuci Di Qosama
              </span>
              <h2 className="mb-6 mt-3 font-[var(--font-display)] text-2xl font-extrabold leading-tight sm:mb-10 sm:mt-4 sm:text-3xl lg:text-5xl">
                Kami Merawat Barang Anda Seperti Milik Kami Sendiri
              </h2>
              <div className="space-y-4 sm:space-y-5">
                <FeatureCard
                  number={1}
                  title="Layanan Lengkap dalam Satu Tempat"
                  description="Qosama Clean tidak hanya melayani laundry pakaian, tetapi juga sepatu, tas, dan helm."
                />
                <FeatureCard
                  number={2}
                  title="Berbagi Melalui Setiap Layanan"
                  description="Sebagai bentuk kepedulian sosial, setiap 1/3 keuntungan Qosama Clean disedekahkan untuk membantu sesama."
                />
                <FeatureCard
                  number={3}
                  title="Pelayanan Cepat dan Fleksibel"
                  description="Tersedia layanan reguler dan express sesuai kebutuhan waktu pelanggan."
                />
              </div>
            </div>

            {/* Right: Image Grid */}
            <div className="order-1 lg:order-2 flex flex-col gap-3 sm:gap-4">
              {/* Top row: 2 equal images */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="group relative h-40 w-full overflow-hidden rounded-2xl shadow-lg xs:h-44 sm:h-56 lg:h-64">
                  <Image
                    alt="Cuci tas ransel"
                    src="/services/tas_user.jpg"
                    fill
                    sizes="(min-width: 1024px) 296px, (min-width: 640px) calc((100vw - 64px) / 2), calc((100vw - 44px) / 2)"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-black/40 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
                    Cuci Tas
                  </span>
                </div>
                <div className="group relative h-40 w-full overflow-hidden rounded-2xl shadow-lg xs:h-44 sm:h-56 lg:h-64">
                  <Image
                    alt="Cuci sepatu sneakers"
                    src="/services/sepatu_user.png"
                    fill
                    sizes="(min-width: 1024px) 296px, (min-width: 640px) calc((100vw - 64px) / 2), calc((100vw - 44px) / 2)"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-black/40 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
                    Cuci Sepatu
                  </span>
                </div>
              </div>
              {/* Bottom: 1 wide image */}
              <div className="group relative h-40 w-full overflow-hidden rounded-2xl shadow-lg xs:h-44 sm:h-56 lg:h-64">
                <Image
                  alt="Cuci helm motor"
                  src="/services/helm_user.png"
                  fill
                  sizes="(min-width: 1024px) 608px, calc(100vw - 32px)"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                <span className="absolute bottom-3 left-3 rounded-full bg-black/40 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
                  Cuci Helm
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== CTA BANNER ====== */}
      <section className="px-4 py-10 sm:px-6 sm:py-20">
        <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 overflow-hidden rounded-3xl bg-secondary p-6 xs:p-8 sm:gap-10 sm:p-12 lg:flex-row lg:gap-16 lg:p-20">
          <div className="relative z-10 max-w-xl text-center lg:text-left">
            <h2 className="mb-3 font-[var(--font-display)] text-2xl font-extrabold leading-tight text-slate-900 sm:mb-5 sm:text-3xl lg:text-5xl">
              Siap untuk Gaya Hidup Lebih Bersih?
            </h2>
            <p className="mb-7 text-sm font-medium text-slate-700 sm:text-base lg:text-lg">
              Hubungi kami sekarang dan dapatkan layanan perawatan terbaik untuk
              sepatu, tas, dan helm Anda.
            </p>
            <div className="flex flex-col gap-3 xs:flex-row xs:flex-wrap lg:justify-start">
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-bold text-white shadow-xl shadow-primary/30 transition-all hover:scale-105 hover:bg-blue-800 sm:w-auto sm:px-10"
              >
                {WA_ICON}
                Mulai Sekarang
              </a>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-900/20 bg-white px-8 py-4 font-bold text-slate-900 shadow-md transition-all hover:scale-105 hover:border-slate-900 sm:w-auto sm:px-10"
              >
                Hubungi Kami
              </a>
            </div>
          </div>

          {/* Decorative WhatsApp icon */}
          <div className="relative z-10 hidden lg:block">
            <div className="flex h-72 w-72 items-center justify-center rounded-full bg-white/20 p-8 backdrop-blur-sm">
              <svg
                viewBox="0 0 24 24"
                fill="white"
                className="h-36 w-36 animate-bounce drop-shadow-2xl"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
          </div>

          {/* Background blobs */}
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* ====== SUB-COMPONENTS ====== */

function FeatureCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="group flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary/40 sm:flex-row sm:gap-5 sm:p-6">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary font-[var(--font-display)] text-xl font-extrabold text-white shadow-md shadow-primary/20 transition-transform duration-300 group-hover:scale-110 sm:h-13 sm:w-13 sm:text-2xl">
        {number}
      </div>
      <div>
        <h4 className="mb-1.5 text-base font-bold sm:text-lg">{title}</h4>
        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}
