"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, LogIn, Menu, Moon, Sun, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLoyalty, setShowLoyalty] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (
      stored === "dark" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });

    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "show_loyalty")
      .single()
      .then(({ data }) => {
        if (data) setShowLoyalty(data.value === "true");
      });

    return () => window.removeEventListener("scroll", onScroll);
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

  const allMenuItems = [
    { title: "Tentang", href: "#tentang" },
    { title: "Layanan", href: "#layanan" },
    { title: "Leaderboard", href: "#dashboard" },
    { title: "Kontak", href: "#kontak" },
  ];

  const menuItems = showLoyalty
    ? allMenuItems
    : allMenuItems.filter((item) => item.href !== "#dashboard");

  const WA_LINK =
    "https://wa.me/6285162810074?text=Halo%20Admin%2C%20saya%20tertarik%20menggunakan%20layanan%20Qosama.%20Mohon%20informasi%20lebih%20lanjut.";

  return (
    <nav className={`sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md transition-shadow duration-300 dark:border-slate-800 dark:bg-background-dark/90 ${scrolled ? "shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50" : ""}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6">
        {/* Brand */}
        <a href="#beranda" className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary sm:h-10 sm:w-10">
            <Image src="/icon.png" alt="Logo" width={40} height={40} />
          </div>
          <span className="truncate font-[var(--font-display)] text-xl font-bold tracking-tight sm:text-2xl">
            Qosama.
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-6 lg:flex xl:gap-8">
          {menuItems.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="group relative font-medium transition-colors hover:text-primary"
            >
              {item.title}
              <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 rounded-full bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDark}
            className="flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {/* Book Now */}
          <a
            href="/admin"
            className="hidden items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 font-bold text-slate-900 transition-all hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-100 lg:flex xl:px-5"
          >
            Admin
            <LogIn className="h-4 w-4" />
          </a>

          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full bg-secondary px-4 py-2.5 font-bold text-slate-900 transition-all hover:shadow-lg hover:shadow-secondary/20 lg:flex xl:px-6"
          >
            Hubungi Kami
            <ArrowRight className="h-4 w-4" />
          </a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
            className="overflow-hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-background-dark lg:hidden"
          >
            <div className="flex flex-col gap-3 px-4 py-5 sm:px-6">
              {menuItems.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    const target = document.querySelector(item.href);
                    if (target) {
                      setIsOpen(false);
                      setTimeout(() => {
                        target.scrollIntoView({ behavior: "smooth" });
                      }, 300);
                    }
                  }}
                  className="rounded-xl px-2 py-2 text-base font-medium transition-colors hover:bg-slate-50 hover:text-primary dark:hover:bg-slate-900"
                >
                  {item.title}
                </a>
              ))}
              <a
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-slate-200 px-6 py-3 text-center font-bold hover:border-primary hover:text-primary dark:border-slate-700"
              >
                Login Admin
              </a>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-secondary px-6 py-3 text-center font-bold text-slate-900 transition-all hover:shadow-lg"
              >
                Hubungi Kami
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
