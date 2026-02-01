"use client";

import Navbar from "@/components/Navbar";
import SequenceScroll from "@/components/SequenceScroll";
import TextReveal from "@/components/TextReveal";
import { ReactLenis } from "lenis/react";
import CountUp from "react-countup";
import { motion } from "motion/react";

export default function Home() {
  return (
    <ReactLenis root>
      <main className="relative bg-[#1e1e20] text-white selection:bg-white selection:text-black">
        <Navbar />

        {/* Hero Section with Scrollytelling */}
        <div id="home">
            <SequenceScroll />
        </div>

        {/* Content overlapping the end of the scroll sequence */}
        <div className="relative z-10 -mt-[100vh] bg-[#1e1e20] pt-20 rounded-t-[3rem] shadow-[0_-50px_100px_rgba(0,0,0,0.5)]">
          
          {/* About Section */}
          <section id="tentang" className="container mx-auto px-6 py-32 md:py-40 flex flex-col items-center text-center">
            <h3 className="text-sm md:text-base font-bold uppercase tracking-widest text-[#888] mb-8">
              Tentang Kami
            </h3>
            <TextReveal
              text="Qosama adalah salah satu jasa untuk membersihkan dan merawat sepatu di Kota Semarang."
              className="text-4xl md:text-7xl font-bold max-w-5xl justify-center"
            />
          </section>

          {/* Bento Grid Features */}
          <section id="fitur" className="container mx-auto px-6 py-20">
            <h3 className="text-sm md:text-base font-bold uppercase tracking-widest text-[#888] mb-12">
              Fitur Unggulan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[800px]">
              <div className="md:col-span-2 row-span-2 relative group overflow-hidden rounded-3xl bg-[#2a2a2c] border border-[#333]">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"/>
                <img src="/sequence/ezgif-frame-120.jpg" alt="Deep Cleaning" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute bottom-8 left-8 z-20">
                    <h4 className="text-3xl font-bold mb-2">Deep Foam Tech</h4>
                    <p className="text-gray-400">Pembersihan hingga ke pori-pori terdalam.</p>
                </div>
              </div>
              <div className="relative group overflow-hidden rounded-3xl bg-[#2a2a2c] border border-[#333] p-8 flex flex-col justify-between">
                <div>
                    <h4 className="text-2xl font-bold mb-2">Anti-Bakteri</h4>
                    <p className="text-gray-400 text-sm">Eliminasi 99.9% bakteri penyebab bau.</p>
                </div>
                <div className="mt-8 text-6xl opacity-20 group-hover:opacity-40 transition-opacity">🛡️</div>
              </div>
              <div className="relative group overflow-hidden rounded-3xl bg-[#2a2a2c] border border-[#333] p-8 flex flex-col justify-between">
                 <div>
                    <h4 className="text-2xl font-bold mb-2">Fast Dry</h4>
                    <p className="text-gray-400 text-sm">Siap pakai dalam wktu singkat.</p>
                </div>
                <div className="mt-8 text-6xl opacity-20 group-hover:opacity-40 transition-opacity">⚡</div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="border-y border-[#333] bg-[#1e1e20]">
              <div className="container mx-auto px-6 py-20 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                  <StatItem number={1000} suffix="+" label="Sepatu Direstorasi" />
                  <StatItem number={98} suffix="%" label="Pelanggan Puas" />
                  <StatItem number={24} suffix="Jam" label="Layanan Kilat" />
                  <StatItem number={1} suffix="" label="Cabang Kota" />
              </div>
          </section>

          {/* Testimonials */}
          <section className="container mx-auto px-6 py-32">
             <h3 className="text-sm md:text-base font-bold uppercase tracking-widest text-[#888] mb-12 text-center">
              Kata Mereka
            </h3>
            <div className="flex overflow-hidden relative">
                <motion.div 
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    className="flex gap-12 whitespace-nowrap"
                >
                    {[1,2,3,4].map((i) => (
                        <div key={i} className="text-5xl md:text-8xl font-bold text-transparent stroke-text opacity-50 hover:opacity-100 transition-opacity cursor-default">
                             "PELAYANAN BINTANG LIMA. HASIL AJAIB." — RIZKY
                        </div>
                    ))}
                </motion.div>
            </div>
          </section>
          
          {/* CTA Section */}
          <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-b from-[#1e1e20] to-black z-0" />
               <motion.div 
                 initial={{ scale: 0.8, opacity: 0 }}
                 whileInView={{ scale: 1, opacity: 1 }}
                 transition={{ duration: 1 }}
                 className="relative z-10 text-center"
               >
                   <h2 className="text-4xl md:text-9xl font-bold mb-8">SIAP MELANGKAH?</h2>
                   <p className="text-xl text-gray-400 mb-12">Jangan biarkan kotoran menghambat gayamu.</p>
                   <a href="https://wa.me/6285162802709" target="_blank" rel="noopener noreferrer" className="inline-block px-12 py-6 bg-white text-black text-xl font-bold rounded-full hover:bg-gray-200 transition-colors">
                       BOOKING SEKARANG
                   </a>
               </motion.div>
          </section>

          {/* Footer */}
          <footer id="kontak" className="bg-black py-20 px-6 border-t border-[#333]">
             <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                 <div>
                     <h3 className="text-3xl font-bold mb-6">QOSAMA.</h3>
                     <p className="text-gray-500">Premium Sneaker Care & Restoration.</p>
                 </div>
                 <div>
                     <h4 className="font-bold mb-6 text-gray-300">LAYANAN</h4>
                     <ul className="space-y-4 text-gray-500">
                         <li>Deep Cleaning</li>
                         <li>Repaint</li>
                         <li>Unyellowing</li>
                     </ul>
                 </div>
                 <div>
                     <h4 className="font-bold mb-6 text-gray-300">SOCIAL</h4>
                     <ul className="space-y-4 text-gray-500">
                         <li><a href="https://instagram.com/qosama_clean" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a></li>
                         <li><a href="https://wa.me/6285162802709" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Whatsapp</a></li>
                     </ul>
                 </div>
                 <div>
                     <h4 className="font-bold mb-6 text-gray-300">LOKASI</h4>
                     <p className="text-gray-500">
                         Jl Mataram, Jl. Kp. Rahayu Raya Jl. Mertojoyo No.118, Kota Semarang
                     </p>
                 </div>
             </div>
             <div className="container mx-auto mt-20 pt-8 border-t border-[#333] text-center text-gray-600 text-sm">
                 © 2026 QOSAMA. All Rights Reserved.
             </div>
          </footer>
        </div>
        
        <style jsx global>{`
           .stroke-text {
               -webkit-text-stroke: 1px rgba(255,255,255,0.5);
           }
        `}</style>
      </main>
    </ReactLenis>
  );
}

function StatItem({ number, suffix, label }: { number: number, suffix: string, label: string }) {
    return (
        <div>
            <div className="text-4xl md:text-7xl font-bold mb-2 text-white">
                <CountUp end={number} enableScrollSpy scrollSpyOnce />{suffix}
            </div>
            <div className="text-gray-500 uppercase tracking-widest text-sm">{label}</div>
        </div>
    )
}
