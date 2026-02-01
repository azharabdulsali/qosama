"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { title: "BERANDA", href: "#home" },
    { title: "TENTANG KAMI", href: "#tentang" },
    { title: "LAYANAN", href: "#fitur" },
    { title: "KONTAK", href: "#kontak" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-between items-center p-6 md:p-12 mix-blend-difference text-white pointer-events-none">
        <div className="text-2xl font-bold tracking-tighter pointer-events-auto">QOSAMA</div>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 group cursor-pointer pointer-events-auto"
        >
          <span className="hidden md:block uppercase text-sm tracking-widest group-hover:opacity-70 transition-opacity">Menu</span>
          <Menu size={24} />
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#1e1e20] text-white flex flex-col justify-center items-center"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 md:top-12 md:right-12 p-2 hover:rotate-90 transition-transform duration-300 cursor-pointer"
            >
              <X size={32} />
            </button>

            <ul className="flex flex-col gap-6 text-center">
              {menuItems.map((item, index) => (
                <motion.li
                  key={item.title}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                    <a 
                        href={item.href} 
                        onClick={() => setIsOpen(false)}
                        className="text-3xl md:text-7xl font-bold tracking-tighter hover:text-gray-400 transition-colors block overflow-hidden group"
                    >
                        <span className="inline-block relative transition-transform duration-500 group-hover:-translate-y-full">
                            {item.title}
                            <span className="block translate-y-full absolute top-0 left-0 w-full text-gray-500">{item.title}</span>
                        </span>
                    </a>
                </motion.li>
              ))}
            </ul>
            
            <div className="absolute bottom-12 flex gap-8 text-sm text-gray-400 uppercase tracking-widest">
                <a href="https://instagram.com/qosama_clean" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
                <a href="https://wa.me/6285162802709" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Whatsapp</a>
                <a href="mailto:hello@qosama.com" className="hover:text-white transition-colors">Email</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
