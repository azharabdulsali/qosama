"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Gift, RefreshCw } from "lucide-react";
import { getRewardStats } from "@/lib/rewards";
import { supabase } from "@/lib/supabase/client";
import type { Customer } from "@/lib/supabase/types";

const PAGE_SIZE = 5;

export default function RewardsDashboard() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showSection, setShowSection] = useState<boolean | null>(null);

  const totals = useMemo(() => {
    return customers.reduce(
      (summary, customer) => {
        const reward = getRewardStats(
          customer.total_orders,
          customer.rewards_used,
        );

        return {
          orders: summary.orders + customer.total_orders,
          rewards: summary.rewards + reward.totalRewards,
          available: summary.available + reward.availableRewards,
        };
      },
      { orders: 0, rewards: 0, available: 0 },
    );
  }, [customers]);

  const totalPages = Math.max(1, Math.ceil(customers.length / PAGE_SIZE));

  const pagedCustomers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return customers.slice(start, start + PAGE_SIZE);
  }, [customers, currentPage]);

  const loadCustomers = async () => {
    setIsLoading(true);
    setError("");

    const { data, error: customersError } = await supabase
      .from("customers")
      .select("*")
      .order("total_orders", { ascending: false })
      .order("name", { ascending: true });

    if (customersError) {
      setError("Data pembeli belum bisa dimuat. Cek koneksi Supabase.");
      setCustomers([]);
    } else {
      setCustomers(data ?? []);
    }

    setIsLoading(false);
    setCurrentPage(1);
  };

  const loadVisibility = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "show_loyalty")
      .single();
    setShowSection(data ? data.value === "true" : true);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadVisibility();
    loadCustomers();
  }, []);

  if (showSection === null) return null;
  if (!showSection) return null;

  return (
    <section
      id="dashboard"
      className="bg-white px-4 py-12 dark:bg-slate-950 sm:px-6 sm:py-16 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary sm:text-sm">
              Customer Loyalty
            </span>
            <h2 className="mt-3 max-w-4xl font-[var(--font-display)] text-2xl font-extrabold leading-tight sm:text-3xl lg:text-5xl">
              List Pembeli & Total Pemesanan
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
              Setiap 5 total pemesanan otomatis menghasilkan 1 reward. Satu
              reward dapat ditukar dengan gratis cuci 1 pasang sepatu.
            </p>
          </div>
          <button
            type="button"
            onClick={loadCustomers}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-primary hover:text-primary dark:border-slate-800 dark:text-slate-200 sm:w-fit"
          >
            <RefreshCw className="h-4 w-4" />
            Muat ulang
          </button>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
          <SummaryMetric label="Total pembeli" value={customers.length} />
          <SummaryMetric label="Total pemesanan" value={totals.orders} />
          <SummaryMetric label="Reward tersedia" value={totals.available} />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
          {isLoading ? (
            <div className="px-5 py-10 text-center text-slate-500">
              Memuat data pembeli...
            </div>
          ) : error ? (
            <div className="px-5 py-10 text-center text-red-500">{error}</div>
          ) : customers.length === 0 ? (
            <div className="px-5 py-10 text-center text-slate-500">
              Belum ada data pembeli.
            </div>
          ) : (
            <div>
              {/* Mobile cards */}
              <div className="grid gap-3 bg-white p-3 dark:bg-slate-950 md:hidden">
                {pagedCustomers.map((customer) => (
                  <CustomerRewardCard key={customer.id} customer={customer} />
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[720px] text-left">
                  <thead className="bg-slate-100 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <tr>
                      <th className="px-5 py-4 font-bold">Nama</th>
                      <th className="px-5 py-4 font-bold">Total pemesanan</th>
                      <th className="px-5 py-4 font-bold">Reward didapat</th>
                      <th className="px-5 py-4 font-bold">Sudah dipakai</th>
                      <th className="px-5 py-4 font-bold">Sisa reward</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950">
                    {pagedCustomers.map((customer) => {
                      const reward = getRewardStats(
                        customer.total_orders,
                        customer.rewards_used,
                      );

                      return (
                        <tr key={customer.id}>
                          <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                            {customer.name}
                          </td>
                          <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                            {customer.total_orders}
                          </td>
                          <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                            {reward.totalRewards}
                          </td>
                          <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                            {customer.rewards_used}
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm font-bold text-slate-900">
                              <Gift className="h-4 w-4" />
                              {reward.availableRewards}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden xs:inline">Sebelumnya</span>
                  </button>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
                  >
                    <span className="hidden xs:inline">Berikutnya</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SummaryMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:text-sm">
        {label}
      </div>
      <div className="mt-2 font-[var(--font-display)] text-2xl font-extrabold text-primary sm:text-3xl">
        {value}
      </div>
    </div>
  );
}

function CustomerRewardCard({ customer }: { customer: Customer }) {
  const reward = getRewardStats(customer.total_orders, customer.rewards_used);

  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-bold text-slate-900 dark:text-white">
            {customer.name}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {customer.total_orders} total pemesanan
          </p>
        </div>
        <span className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm font-bold text-slate-900">
          <Gift className="h-4 w-4" />
          {reward.availableRewards}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-slate-500">Reward didapat</dt>
          <dd className="mt-1 font-bold text-slate-900 dark:text-white">
            {reward.totalRewards}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Sudah dipakai</dt>
          <dd className="mt-1 font-bold text-slate-900 dark:text-white">
            {customer.rewards_used}
          </dd>
        </div>
      </dl>
    </article>
  );
}
