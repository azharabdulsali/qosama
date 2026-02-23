"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check system preference or localStorage
    const stored = localStorage.getItem("theme");
    if (
      stored === "dark" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDark = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return next;
    });
  };

  const menuItems = [
    { title: "Beranda", href: "#beranda" },
    { title: "Tentang", href: "#tentang" },
    { title: "Layanan", href: "#layanan" },
    { title: "Proses", href: "#proses" },
    { title: "Kontak", href: "#kontak" },
  ];

  const WA_LINK =
    "https://wa.me/6285162810074?text=Halo%20Admin%2C%20saya%20tertarik%20menggunakan%20layanan%20Qosama.%20Mohon%20informasi%20lebih%20lanjut.";

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand */}
        <a href="#beranda" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Image src="/icon.png" alt="Logo" width={40} height={40} />
          </div>
          <span className="font-[var(--font-display)] text-2xl font-bold tracking-tight">
            Qosama.
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {menuItems.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="font-medium hover:text-primary transition-colors"
            >
              {item.title}
            </a>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDark}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle dark mode"
          >
            <span className="material-symbols-outlined text-xl">
              {isDark ? "light_mode" : "dark_mode"}
            </span>
          </button>

          {/* Book Now */}
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex bg-secondary text-slate-900 px-6 py-2.5 rounded-full font-bold hover:shadow-lg hover:shadow-secondary/20 transition-all items-center gap-2"
          >
            Book Now
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">
              {isOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-background-dark border-b border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {menuItems.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="font-medium text-lg hover:text-primary transition-colors"
                >
                  {item.title}
                </a>
              ))}
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="md:hidden bg-secondary text-slate-900 px-6 py-3 rounded-full font-bold text-center hover:shadow-lg transition-all"
              >
                Book Now
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
