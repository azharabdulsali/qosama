"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { getSortedQueue, SortedQueueItem } from "@/app/admin/queueActions";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Users, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export default function SmartQueue() {
  const [queue, setQueue] = useState<SortedQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sdmCount, setSdmCount] = useState(3);

  const loadSettingsAndQueue = async () => {
    try {
      // 1. Get current sdm_count from site_settings
      const { data: sdmData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "sdm_count")
        .single();
      
      const currentSdm = sdmData ? Number(sdmData.value) : 3;
      setSdmCount(currentSdm);

      // 2. Load the sorted queue using Server Action
      const sortedData = await getSortedQueue(currentSdm);
      setQueue(sortedData);
    } catch (err) {
      console.error("Gagal memuat antrean:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsAndQueue();

    // Real-time listener for both laundry queue changes and sdm setting adjustments
    const channel = supabase
      .channel("realtime-laundry-queue")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "laundry_queue" },
        () => {
          loadSettingsAndQueue();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings" },
        () => {
          loadSettingsAndQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Secure customer name masking algorithm for privacy
  function maskName(name: string): string {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    return parts
      .map((part) => {
        if (part.length <= 2) {
          return part[0] + (part.length > 1 ? "*" : "");
        }
        return part[0] + "*".repeat(part.length - 2) + part[part.length - 1];
      })
      .join(" ");
  }

  return (
    <section id="antrean" className="px-4 py-12 sm:px-6 sm:py-16 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Sistem Antrean Cerdas
          </span>
          <h2 className="font-[var(--font-display)] text-3xl font-extrabold tracking-tight sm:text-4xl">
            Live Pantauan Antrean Laundry
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Nomor urut pengerjaan dihitung otomatis menggunakan model AI Decision Tree (ONNX) berdasarkan prioritas & batas waktu.
          </p>
        </div>

        {/* Global Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50 flex items-center gap-3">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">SDM Aktif Hari Ini</div>
              <div className="text-lg font-bold">{sdmCount} Orang</div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50 flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Antrean Menunggu</div>
              <div className="text-lg font-bold">
                {queue.filter((i) => i.status === "pending").length} Cucian
              </div>
            </div>
          </div>

          <div className="col-span-2 md:col-span-1 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50 flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Sedang Diproses</div>
              <div className="text-lg font-bold">
                {queue.filter((i) => i.status === "proses").length} Cucian
              </div>
            </div>
          </div>
        </div>

        {/* Queue Board Container */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
          {isLoading ? (
            <div className="px-5 py-16 text-center text-slate-500">
              <Clock className="h-8 w-8 animate-spin mx-auto text-primary mb-3" />
              Menghitung prioritas pengerjaan...
            </div>
          ) : queue.length === 0 ? (
            <div className="px-5 py-16 text-center text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500 mb-3" />
              Antrean kosong. Semua cucian telah diselesaikan!
            </div>
          ) : (
            <div>
              {/* Mobile Card Layout */}
              <div className="grid gap-4 p-4 md:hidden">
                <AnimatePresence mode="popLayout">
                  {queue.map((item) => (
                    <motion.div
                      key={item.id}
                      layoutId={`item-${item.id}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary font-bold text-white text-xs">
                            {item.workOrder}
                          </span>
                          <h3 className="font-bold text-slate-900 dark:text-white">
                            {maskName(item.nama_pelanggan)}
                          </h3>
                        </div>
                        <span className="font-mono text-xs font-semibold text-slate-400">
                          #{item.no_antrean}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 block mb-0.5">Layanan</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{item.jenis_layanan}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Sisa Waktu</span>
                          <span className={`font-bold ${item.sisaHariSorting < 0 ? "text-rose-500 font-extrabold" : "text-emerald-500"}`}>
                            {item.sisaHariSorting < 0
                              ? `Terlambat ${Math.abs(item.sisaHariSorting)} hari`
                              : item.sisaHariSorting === 0
                              ? "Hari ini"
                              : `${item.sisaHariSorting} hari`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <span className={`rounded-full px-2.5 py-1 text-2xs font-extrabold ${
                          item.predictedPriority === "Prioritas Tinggi"
                            ? "bg-rose-500/10 text-rose-500"
                            : item.predictedPriority === "Prioritas Sedang"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-emerald-500/10 text-emerald-500"
                        }`}>
                          {item.predictedPriority}
                        </span>

                        <span className={`rounded-full px-2.5 py-1 text-2xs font-extrabold uppercase ${
                          item.status === "proses"
                            ? "bg-blue-500/10 text-blue-500"
                            : "bg-slate-500/10 text-slate-400"
                        }`}>
                          {item.status === "proses" ? "Diproses" : "Antre"}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-2xs uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:bg-slate-900 dark:text-slate-500 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-4 font-bold text-center w-24">No Urut</th>
                      <th className="px-6 py-4 font-bold">Nama Pelanggan</th>
                      <th className="px-6 py-4 font-bold">No Antrean</th>
                      <th className="px-6 py-4 font-bold">Jenis Layanan</th>
                      <th className="px-6 py-4 font-bold">Berat</th>
                      <th className="px-6 py-4 font-bold">Sisa Waktu</th>
                      <th className="px-6 py-4 font-bold">Status Antrean</th>
                      <th className="px-6 py-4 font-bold text-right">Prioritas Kerja</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    <AnimatePresence mode="popLayout">
                      {queue.map((item) => {
                        const sisaHari = item.sisaHariSorting;
                        let sisaText = `${sisaHari} hari`;
                        let sisaColor = "text-emerald-500";
                        if (sisaHari < 0) {
                          sisaText = `Terlambat ${Math.abs(sisaHari)} hari`;
                          sisaColor = "text-rose-500 font-bold flex items-center gap-1";
                        } else if (sisaHari === 0) {
                          sisaText = "Hari ini";
                          sisaColor = "text-amber-500 font-bold";
                        } else if (sisaHari === 1) {
                          sisaText = "Besok";
                        }

                        let prioBg = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
                        if (item.predictedPriority === "Prioritas Tinggi") {
                          prioBg = "bg-rose-500/10 text-rose-600 dark:text-rose-400";
                        } else if (item.predictedPriority === "Prioritas Sedang") {
                          prioBg = "bg-amber-500/10 text-amber-600 dark:text-amber-400";
                        } else if (item.predictedPriority === "Prioritas Rendah") {
                          prioBg = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
                        }

                        return (
                          <motion.tr
                            key={item.id}
                            layoutId={`item-${item.id}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.35, ease: "easeInOut" }}
                            className="hover:bg-slate-50/40 dark:hover:bg-slate-900/30 transition-colors"
                          >
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-white text-sm">
                                {item.workOrder}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                              {maskName(item.nama_pelanggan)}
                            </td>
                            <td className="px-6 py-4 font-mono text-slate-400">
                              #{item.no_antrean}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`font-semibold ${
                                item.jenis_layanan === "Extra Express"
                                  ? "text-rose-500 font-extrabold"
                                  : item.jenis_layanan === "Express"
                                  ? "text-amber-500"
                                  : "text-blue-500"
                              }`}>
                                {item.jenis_layanan}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                              {item.berat} Kg
                            </td>
                            <td className="px-6 py-4">
                              <span className={sisaColor}>
                                {sisaHari < 0 && <AlertCircle className="h-4 w-4 inline" />}
                                {sisaText}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-2xs font-extrabold uppercase ${
                                item.status === "proses"
                                  ? "bg-blue-500/10 text-blue-500"
                                  : "bg-slate-500/10 text-slate-400"
                              }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${item.status === "proses" ? "bg-blue-500 animate-pulse" : "bg-slate-400"}`} />
                                {item.status === "proses" ? "Diproses" : "Menunggu"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold ${prioBg}`}>
                                {item.predictedPriority}
                              </span>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
