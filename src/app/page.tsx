"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CountUp from "react-countup";
import { motion } from "motion/react";
import Image from "next/image";

const WA_LINK =
  "https://wa.me/6285162810074?text=Halo%20Admin%2C%20saya%20tertarik%20menggunakan%20layanan%20Qosama.%20Mohon%20informasi%20lebih%20lanjut.";

export default function Home() {
  return (
    <main
      id="beranda"
      className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-[var(--font-body)] transition-colors duration-300"
    >
      <Navbar />

      {/* ====== BUSINESS PROFILE SECTION ====== */}
      <section id="tentang" className="py-24 px-6 overflow-hidden bg-pattern">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Image */}
            <div className="relative">
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  alt="Qosama professional shoe cleaning"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7ki6Y1lSYOkEOohiUAcmO0FfGXAWRdKg5PsUxjgxRHqQenndDHV-VcIrVzM0CmUsEQN_ECGD1ZkFP3pFb6dKYXZZ5R6SFmpn_hUfT2duOBCDCahgE2uCYMq_ABF76_1JnNxZ3kqA6XoyjlHzoCsVyjdUceUctMAhwNohjlgPrkI0KtRxdv0R0mxIWvujSp1erYRkcz3ZOAs2PIVwFiB9gRs8bxL6HjIxgUf6P_lkAm5f5yzUojvQLeSrTS1c8PWfo4mgNkwn189g"
                  width={800}
                  height={600}
                  className="w-full h-[600px] object-cover"
                  priority
                />
              </div>
              <div className="absolute -bottom-10 -right-10 z-20 bg-primary text-white p-8 rounded-3xl shadow-2xl max-w-xs">
                <div className="text-5xl font-[var(--font-display)] font-bold mb-1">
                  3+
                </div>
                <div className="text-lg font-medium opacity-90">
                  Tahun Pengalaman Perawatan Profesional
                </div>
              </div>
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-secondary rounded-full blur-3xl opacity-20"></div>
            </div>

            {/* Right: Text */}
            <div className="space-y-8">
              <div>
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm tracking-wider uppercase mb-4">
                  Profil Bisnis Kami
                </span>
                <h2 className="text-4xl lg:text-5xl font-[var(--font-display)] font-extrabold leading-tight mb-6">
                  Kami Menyediakan Layanan{" "}
                  <span className="text-primary">Perawatan Profesional</span>{" "}
                  untuk Kebutuhan Harian Anda
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  Qosama adalah solusi perawatan premium di Kota Semarang. Baik
                  itu sepatu kesayangan, tas branded, maupun helm harian — kami
                  menangani setiap item dengan teknik khusus dan teknologi
                  terkini untuk hasil maksimal.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-secondary font-bold">
                      check_circle
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Ramah Lingkungan</h4>
                    <p className="text-sm text-slate-500">
                      Aman untuk Anda dan alam.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-secondary font-bold">
                      shutter_speed
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Pengerjaan Cepat</h4>
                    <p className="text-sm text-slate-500">
                      Layanan express 24 jam.
                    </p>
                  </div>
                </div>
              </div>
              <a
                href="#layanan"
                className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-800 transition-all inline-flex items-center gap-3"
              >
                Selengkapnya
                <span className="material-symbols-outlined">chevron_right</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ====== STATS SECTION ====== */}
      <section className="bg-primary py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            <StatItem number={1000} suffix="+" label="Sepatu Dibersihkan" />
            <StatItem number={500} suffix="+" label="Helm Direstorasi" />
            <StatItem number={1000} suffix="+" label="Pelanggan Puas" />
            <StatItem number={850} suffix="+" label="Tas Dibersihkan" />
          </div>
        </div>
      </section>

      {/* ====== WORKFLOW / PROCESS SECTION ====== */}
      <section id="proses" className="py-24 px-6 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-primary font-bold tracking-widest uppercase text-sm">
              Alur Kerja
            </span>
            <h2 className="text-4xl lg:text-5xl font-[var(--font-display)] font-extrabold mt-4 mb-6">
              Langkah Mudah Merawat Barang Kesayangan
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Proses kami yang seamless memastikan barang Anda dirawat dari saat
              meninggalkan rumah hingga kembali seperti baru.
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-12"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
              <WorkflowStep
                step={1}
                icon="calendar_month"
                title="Pesan Online"
                description="Jadwalkan perawatan via WhatsApp atau kunjungi langsung outlet kami."
              />
              <WorkflowStep
                step={2}
                icon="local_shipping"
                title="Jemput di Rumah"
                description="Tim profesional kami akan menjemput barang Anda sesuai waktu yang disepakati."
              />
              <WorkflowStep
                step={3}
                icon="wash"
                title="Perawatan Profesional"
                description="Pembersihan ahli menggunakan produk premium dan peralatan khusus."
              />
              <WorkflowStep
                step={4}
                icon="inventory_2"
                title="Express Delivery"
                description="Barang bersih dan terkemas rapi diantar kembali ke pintu Anda."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ====== WHY CHOOSE US / SERVICES SECTION ====== */}
      <section
        id="layanan"
        className="py-24 px-6 bg-slate-50 dark:bg-slate-900"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div className="order-2 lg:order-1">
              <span className="text-primary font-bold uppercase tracking-widest text-sm">
                Mengapa Pilih Kami
              </span>
              <h2 className="text-4xl lg:text-5xl font-[var(--font-display)] font-extrabold mt-4 mb-8">
                Kami Merawat Barang Anda Seperti Milik Kami Sendiri
              </h2>
              <div className="space-y-6">
                <FeatureCard
                  icon="eco"
                  title="Perawatan Ramah Lingkungan"
                  description="Kami menggunakan deterjen biodegradable dan teknologi hemat air di semua proses kami."
                />
                <FeatureCard
                  icon="verified_user"
                  title="Aman & Terjamin"
                  description="Barang Anda diasuransikan penuh selama transit dan perawatan. Jaminan ketenangan pikiran."
                />
                <FeatureCard
                  icon="style"
                  title="Penanganan Spesialis"
                  description="Perawatan ahli untuk kulit, suede, canvas, dan material premium dari berbagai brand."
                />
              </div>
            </div>

            {/* Right: Image Grid */}
            <div className="order-1 lg:order-2 grid grid-cols-2 gap-4">
              <Image
                alt="Proses cuci sepatu"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUF_ilhx1PmFTzBoUpbidPUP2yymjiRFFErNKcAsnw7FtZ6VuoPytnJITROQgl512RaZ2sK8JXcjCK6OietDzz9l6lqCcLiJFKpFSKzFiGYayW2C1T69lY7ron66p4AutmyqVV5RpxHtIktoHibRnYjY6fStpNh7Uj1RZEu3stT0bj1BBZOgLaGUYjM_kFnM2bXeDdza6f49hQSwvFrFgEAeEDUGXrdvJ-bxmdk-0C0BM3kKPkqSHlOa7rfRhiDq1VjB3wAgxuxQE"
                width={400}
                height={320}
                className="rounded-2xl h-80 w-full object-cover shadow-lg"
              />
              <Image
                alt="Perawatan tas premium"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMvFHtmIqqIOmqpO7fwDjzf4-BMeoEsjWOvdCIpADiBrkRYIzRO-GIevE5VRzm6ymu_ixM4mKGGQtE07K8bBT1WG4T-TZQAzLeHtU03VCbXKpnp6lDYUo_gozDNXI_ytjsRlh9l_n_EirOM_RvxXEfNhqKV189azrMhiqRmJO5AqoNQVCcxHUt8YxJ_91-NiA9NZEAAw3f3Q5jXqwlI9y0UNFbi7-izbN2Hp1KE3jKJD-gUhEm_0oQ697wTs_lnxGwlTXYQU_LEMw"
                width={400}
                height={320}
                className="rounded-2xl h-80 w-full object-cover shadow-lg mt-8"
              />
              <Image
                alt="Layanan cuci helm"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_KpuSgb6kAFrF0jD9lwiEQb1F_QvDgZ1p1d8q9f2GmJ5JLwimyeuiD_GaCKwK50Ty2juvfmg1SfVucuueUCz1pV8CgNrjIzDyhnLSSfhkzT3eqWyjqw81rGYnvoc7cWsx1mmrZQ5lyO34tZFvlbK6VcnHXFuVUuwG5gZ7PjWM1YNJ3J50y5d3bS46ibnx2HYhgWnPqX0JgzmVYVRGfMgr02ABqo8gDZPIFydGCqvoMmaAvWIuA-JQxDRZ-_BoRkNUBoTVtYWjs5w"
                width={400}
                height={320}
                className="rounded-2xl h-80 w-full object-cover shadow-lg -mt-8"
              />
              <Image
                alt="Peralatan pembersih profesional"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCP8bFDuZ8aRrF3h6Gyw21IYo5ipbAqRg16dVnaBRRwU9Jdq3dYMMKtA_rv3lvXGfcZkJ1kGvLJktO1rfJtP55pJkjMRcWkzxe9Z9mRkYoZ_151RrhjmwkDxuMrLcnrQQ-2PnyEYWcVhHMU1SAMccH4Xuo8PugZGhXlKbNJoNyBIF7ACz1cY-j6TcvYSRDjs11YNtUorjIXqXafbyzpYkpnZmgb8_eGHckjU4eoP4Z7z4LMKZgXDiycu-5OQdYrpDdCkbZIbXxGrAA"
                width={400}
                height={320}
                className="rounded-2xl h-80 w-full object-cover shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ====== CTA BANNER ====== */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto bg-secondary rounded-[2.5rem] p-12 lg:p-20 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="relative z-10 max-w-xl text-center lg:text-left">
            <h2 className="text-4xl lg:text-5xl font-[var(--font-display)] font-extrabold text-slate-900 mb-6">
              Siap untuk Gaya Hidup Lebih Bersih?
            </h2>
            <p className="text-xl text-slate-800 font-medium mb-10">
              Dapatkan diskon 20% untuk pesanan pertama Anda. Hubungi kami
              sekarang!
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-white px-10 py-4 rounded-xl font-bold shadow-xl hover:scale-105 transition-all inline-block"
              >
                Mulai Sekarang
              </a>
              <a
                href="https://wa.me/6285162810074"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-slate-900 px-10 py-4 rounded-xl font-bold shadow-md hover:scale-105 transition-all inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined">call</span>
                Hubungi Kami
              </a>
            </div>
          </div>
          <div className="relative z-10 hidden lg:block">
            <div className="w-80 h-80 bg-white/20 rounded-full flex items-center justify-center p-8 backdrop-blur-sm">
              <span className="material-symbols-outlined text-[120px] text-white animate-bounce">
                shopping_basket
              </span>
            </div>
          </div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* ====== SUB-COMPONENTS ====== */

function StatItem({
  number,
  suffix,
  label,
}: {
  number: number;
  suffix: string;
  label: string;
}) {
  return (
    <div className="text-center group">
      <div className="text-secondary text-5xl font-[var(--font-display)] font-extrabold mb-3 group-hover:scale-110 transition-transform">
        <CountUp end={number} enableScrollSpy scrollSpyOnce />
        {suffix}
      </div>
      <div className="text-blue-100 font-medium tracking-wide uppercase text-sm">
        {label}
      </div>
    </div>
  );
}

function WorkflowStep({
  step,
  icon,
  title,
  description,
}: {
  step: number;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: step * 0.1 }}
      className="relative text-center group"
    >
      <div className="mb-8 relative inline-block">
        <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl shadow-xl flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-300 border border-slate-100 dark:border-slate-700">
          <span className="material-symbols-outlined text-primary text-4xl">
            {icon}
          </span>
        </div>
        <div className="absolute -top-3 -right-3 w-10 h-10 bg-secondary rounded-full flex items-center justify-center font-bold text-slate-900 shadow-lg z-20">
          {step}
        </div>
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed px-4">
        {description}
      </p>
    </motion.div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex gap-6">
      <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-primary">{icon}</span>
      </div>
      <div>
        <h4 className="text-xl font-bold mb-2">{title}</h4>
        <p className="text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </div>
  );
}
