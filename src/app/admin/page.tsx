"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import {
  Check,
  Eye,
  EyeOff,
  Trash2,
  Gift,
  LogOut,
  Minus,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { getRewardStats } from "@/lib/rewards";
import { supabase } from "@/lib/supabase/client";
import type { Customer } from "@/lib/supabase/types";

const INACTIVITY_TIMEOUT = 10 * 60 * 1000;

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isCustomersLoading, setIsCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [customerName, setCustomerName] = useState("");
  const [totalOrders, setTotalOrders] = useState("");
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [showLoyalty, setShowLoyalty] = useState(true);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredCustomers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return customers.slice(0, 8);
    }

    return customers
      .filter((customer) => customer.name.toLowerCase().includes(query))
      .slice(0, 8);
  }, [customers, searchTerm]);

  const totals = useMemo(() => {
    return customers.reduce(
      (summary, customer) => {
        const reward = getRewardStats(
          customer.total_orders,
          customer.rewards_used
        );

        return {
          orders: summary.orders + customer.total_orders,
          available: summary.available + reward.availableRewards,
        };
      },
      { orders: 0, available: 0 }
    );
  }, [customers]);

  const loadCustomers = async () => {
    setIsCustomersLoading(true);
    setCustomersError("");

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      setCustomers([]);
      setCustomersError("Data pembeli belum bisa dimuat.");
    } else {
      setCustomers(data ?? []);
    }

    setIsCustomersLoading(false);
  };

  const loadSettings = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "show_loyalty")
      .single();
    if (data) setShowLoyalty(data.value === "true");
  };

  const toggleLoyalty = async () => {
    const next = !showLoyalty;
    setActionMessage("");
    const { error } = await supabase
      .from("site_settings")
      .update({ value: String(next) })
      .eq("key", "show_loyalty");
    if (!error) {
      setShowLoyalty(next);
      setActionMessage(
        next
          ? "Customer Loyalty ditampilkan di dashboard publik."
          : "Customer Loyalty disembunyikan dari dashboard publik."
      );
    } else {
      setActionMessage("Gagal mengubah pengaturan.");
    }
  };

  const openEditDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerName(customer.name);
    setTotalOrders(String(customer.total_orders));
    setFormError("");
    setActionMessage("");
    setDialogMode("edit");
    setIsDialogOpen(true);
  };

  useEffect(() => {
    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setIsAuthLoading(false);
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadCustomers();
      loadSettings();
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    const resetTimer = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(async () => {
        await supabase.auth.signOut();
        setCustomers([]);
      }, INACTIVITY_TIMEOUT);
    };
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) =>
      window.addEventListener(e, resetTimer, { passive: true })
    );
    resetTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [session]);

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSigningIn(true);
    setAuthError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(`Gagal login: ${error.message}`);
    }

    setIsSigningIn(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCustomers([]);
  };

  const openCustomerDialog = () => {
    setSearchTerm("");
    setSelectedCustomer(null);
    setCustomerName("");
    setTotalOrders("");
    setFormError("");
    setActionMessage("");
    setDialogMode("add");
    setIsDialogOpen(true);
  };

  const closeCustomerDialog = () => {
    if (!isSaving) {
      setIsDialogOpen(false);
    }
  };

  const chooseCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerName(customer.name);
    setTotalOrders(String(customer.total_orders));
    setFormError("");
  };

  const startNewCustomer = () => {
    setSelectedCustomer(null);
    setCustomerName(searchTerm.trim());
    setTotalOrders("0");
    setFormError("");
  };

  const saveCustomer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setActionMessage("");

    const cleanName = customerName.trim();
    const parsedOrders = Number(totalOrders);

    if (!cleanName) {
      setFormError("Nama pembeli wajib diisi.");
      return;
    }

    if (!Number.isInteger(parsedOrders) || parsedOrders < 0) {
      setFormError("Total pemesanan harus angka bulat minimal 0.");
      return;
    }

    if (
      selectedCustomer &&
      parsedOrders < selectedCustomer.rewards_used * 5
    ) {
      setFormError(
        "Total pemesanan tidak boleh lebih kecil dari reward yang sudah dipakai."
      );
      return;
    }

    setIsSaving(true);

    const response = selectedCustomer
      ? await supabase
          .from("customers")
          .update({
            name: cleanName,
            total_orders: parsedOrders,
          })
          .eq("id", selectedCustomer.id)
          .select()
          .single()
      : await supabase
          .from("customers")
          .insert({
            name: cleanName,
            total_orders: parsedOrders,
            rewards_used: 0,
          })
          .select()
          .single();

    if (response.error) {
      setFormError(
        response.error.code === "23505"
          ? "Nama sudah ada. Pilih nama tersebut dari hasil pencarian."
          : "Data belum bisa disimpan. Pastikan tabel dan RLS Supabase sudah dibuat."
      );
      setIsSaving(false);
      return;
    }

    await loadCustomers();
    setActionMessage("Data pembeli berhasil disimpan.");
    setIsSaving(false);
    setIsDialogOpen(false);
  };

  const markRewardUsed = async (customer: Customer) => {
    const reward = getRewardStats(customer.total_orders, customer.rewards_used);

    if (reward.availableRewards < 1) {
      return;
    }

    setActionMessage("");
    const { error } = await supabase
      .from("customers")
      .update({ rewards_used: customer.rewards_used + 1 })
      .eq("id", customer.id);

    if (error) {
      setActionMessage("Reward belum bisa ditandai.");
      return;
    }

    setActionMessage(`Reward ${customer.name} ditandai sudah dipakai.`);
    await loadCustomers();
  };

  const undoRewardUsed = async (customer: Customer) => {
    if (customer.rewards_used < 1) {
      return;
    }

    setActionMessage("");
    const { error } = await supabase
      .from("customers")
      .update({ rewards_used: customer.rewards_used - 1 })
      .eq("id", customer.id);

    if (error) {
      setActionMessage("Status reward belum bisa dikembalikan.");
      return;
    }

    setActionMessage(`Pemakaian reward ${customer.name} dikurangi.`);
    await loadCustomers();
  };

  const deleteCustomer = async (customer: Customer) => {
    const confirmed = window.confirm(
      `Hapus data ${customer.name}? Data total pemesanan dan reward customer ini akan ikut hilang.`
    );

    if (!confirmed) {
      return;
    }

    setActionMessage("");
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", customer.id);

    if (error) {
      setActionMessage("Customer belum bisa dihapus.");
      return;
    }

    setActionMessage(`Customer ${customer.name} berhasil dihapus.`);
    await loadCustomers();
  };

  if (isAuthLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-700 dark:bg-slate-950 dark:text-slate-200">
        Memeriksa sesi admin...
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 sm:py-10">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center">
          <form
            onSubmit={handleSignIn}
            className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-primary sm:text-sm">
              Admin Qosama
            </span>
            <h1 className="mt-3 font-[var(--font-display)] text-2xl font-extrabold sm:text-3xl">
              Login admin
            </h1>

            <label className="mt-8 block text-sm font-bold" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition-colors focus:border-primary dark:border-slate-700 dark:bg-slate-950"
              required
            />

            <label className="mt-5 block text-sm font-bold" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition-colors focus:border-primary dark:border-slate-700 dark:bg-slate-950"
              required
            />

            {authError && (
              <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-950/40">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSigningIn}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check className="h-4 w-4" />
              {isSigningIn ? "Masuk..." : "Masuk"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary sm:text-sm">
              Panel Admin
            </span>
            <h1 className="mt-2 font-[var(--font-display)] text-2xl font-extrabold leading-tight sm:text-4xl">
              Kelola pembeli dan reward
            </h1>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:flex sm:flex-wrap">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-bold transition-colors hover:border-primary hover:text-primary dark:border-slate-800"
            >
              Dashboard publik
            </Link>
            <button
              type="button"
              onClick={toggleLoyalty}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${
                showLoyalty
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "border-slate-200 text-slate-500 hover:border-primary hover:text-primary dark:border-slate-700"
              }`}
            >
              {showLoyalty ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {showLoyalty ? "Loyalty ON" : "Loyalty OFF"}
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-950"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          </div>
        </header>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <AdminMetric label="Total pembeli" value={customers.length} />
          <AdminMetric label="Total pemesanan" value={totals.orders} />
          <AdminMetric label="Reward tersedia" value={totals.available} />
        </div>

        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="break-all text-sm text-slate-500 dark:text-slate-400">
            Login sebagai {session.user.email}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            <button
              type="button"
              onClick={loadCustomers}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold transition-colors hover:border-primary hover:text-primary dark:border-slate-800"
            >
              <RefreshCw className="h-4 w-4" />
              Muat ulang
            </button>
            <button
              type="button"
              onClick={openCustomerDialog}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-yellow-300"
            >
              <Plus className="h-4 w-4" />
              Input pembeli
            </button>
          </div>
        </div>

        {actionMessage && (
          <div className="mb-5 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-bold text-primary">
            {actionMessage}
          </div>
        )}

        {customersError && (
          <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-950/40">
            {customersError}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {isCustomersLoading ? (
            <div className="px-5 py-10 text-center text-slate-500">
              Memuat data...
            </div>
          ) : customers.length === 0 ? (
            <div className="px-5 py-10 text-center text-slate-500">
              Belum ada pembeli. Mulai dari tombol Input pembeli.
            </div>
          ) : (
            <div>
              <div className="grid gap-3 p-3 md:hidden">
                {customers.map((customer) => (
                  <AdminCustomerCard
                    key={customer.id}
                    customer={customer}
                    onEdit={() => openEditDialog(customer)}
                    onMarkUsed={() => markRewardUsed(customer)}
                    onUndoUsed={() => undoRewardUsed(customer)}
                    onDelete={() => deleteCustomer(customer)}
                  />
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[860px] text-left">
                  <thead className="bg-slate-100 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <tr>
                      <th className="px-5 py-4 font-bold">Nama</th>
                      <th className="px-5 py-4 font-bold">Total pemesanan</th>
                      <th className="px-5 py-4 font-bold">Reward</th>
                      <th className="px-5 py-4 font-bold">Dipakai</th>
                      <th className="px-5 py-4 font-bold">Tersedia</th>
                      <th className="px-5 py-4 font-bold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {customers.map((customer) => {
                      const reward = getRewardStats(
                        customer.total_orders,
                        customer.rewards_used
                      );

                      return (
                        <tr key={customer.id}>
                          <td className="px-5 py-4 font-bold">
                            {customer.name}
                          </td>
                          <td className="px-5 py-4">
                            {customer.total_orders}
                          </td>
                          <td className="px-5 py-4">{reward.totalRewards}</td>
                          <td className="px-5 py-4">
                            {customer.rewards_used}
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm font-bold text-slate-950">
                              <Gift className="h-4 w-4" />
                              {reward.availableRewards}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => openEditDialog(customer)}
                                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold transition-colors hover:border-primary hover:text-primary dark:border-slate-700"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => markRewardUsed(customer)}
                                disabled={reward.availableRewards < 1}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Check className="h-4 w-4" />
                                Pakai
                              </button>
                              <button
                                type="button"
                                onClick={() => undoRewardUsed(customer)}
                                disabled={customer.rewards_used < 1}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700"
                              >
                                <Minus className="h-4 w-4" />
                                Undo
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteCustomer(customer)}
                                className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-red-600 transition-colors hover:border-red-500 hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950/40"
                              >
                                <Trash2 className="h-4 w-4" />
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 px-3 py-3 sm:items-center sm:px-4 sm:py-6">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl dark:bg-slate-900 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary sm:text-sm">
                  {dialogMode === "add" ? "Input manual" : "Edit data"}
                </span>
                <h2 className="mt-2 font-[var(--font-display)] text-xl font-extrabold sm:text-2xl">
                  {dialogMode === "add" ? "Cari atau tambah pembeli" : "Edit data pembeli"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeCustomerDialog}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 transition-colors hover:border-primary hover:text-primary dark:border-slate-700"
                aria-label="Tutup dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {dialogMode === "add" && (
              <>
                <div className="mb-5">
                  <label className="mb-2 block text-sm font-bold" htmlFor="search">
                    Cari nama pembeli
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="search"
                      type="search"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Ketik nama pembeli"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 outline-none transition-colors focus:border-primary dark:border-slate-700 dark:bg-slate-950"
                    />
                  </div>
                </div>

                <div className="mb-5 grid gap-2">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => chooseCustomer(customer)}
                      className={`flex flex-col gap-1 rounded-xl border px-4 py-3 text-left transition-colors sm:flex-row sm:items-center sm:justify-between ${
                        selectedCustomer?.id === customer.id
                          ? "border-primary bg-primary/10"
                          : "border-slate-200 hover:border-primary dark:border-slate-700"
                      }`}
                    >
                      <span className="font-bold">{customer.name}</span>
                      <span className="text-sm text-slate-500">
                        {customer.total_orders} pemesanan
                      </span>
                    </button>
                  ))}

                  {searchTerm.trim() && !selectedCustomer && (
                    <button
                      type="button"
                      onClick={startNewCustomer}
                      className="rounded-xl border border-dashed border-primary px-4 py-3 text-left font-bold text-primary"
                    >
                      Tambah nama baru: {searchTerm.trim()}
                    </button>
                  )}
                </div>
              </>
            )}

            <form onSubmit={saveCustomer}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    className="mb-2 block text-sm font-bold"
                    htmlFor="name"
                  >
                    Nama pembeli
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition-colors focus:border-primary dark:border-slate-700 dark:bg-slate-950"
                    required
                  />
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm font-bold"
                    htmlFor="totalOrders"
                  >
                    Total pemesanan
                  </label>
                  <input
                    id="totalOrders"
                    type="number"
                    min={0}
                    step={1}
                    value={totalOrders}
                    onChange={(event) => setTotalOrders(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition-colors focus:border-primary dark:border-slate-700 dark:bg-slate-950"
                    required
                  />
                </div>
              </div>

              {formError && (
                <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-950/40">
                  {formError}
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeCustomerDialog}
                  className="rounded-xl border border-slate-200 px-5 py-3 font-bold transition-colors hover:border-primary hover:text-primary dark:border-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Check className="h-4 w-4" />
                  {isSaving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function AdminMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:text-sm">
        {label}
      </div>
      <div className="mt-2 font-[var(--font-display)] text-2xl font-extrabold text-primary sm:text-3xl">
        {value}
      </div>
    </div>
  );
}

function AdminCustomerCard({
  customer,
  onEdit,
  onMarkUsed,
  onUndoUsed,
  onDelete,
}: {
  customer: Customer;
  onEdit: () => void;
  onMarkUsed: () => void;
  onUndoUsed: () => void;
  onDelete: () => void;
}) {
  const reward = getRewardStats(customer.total_orders, customer.rewards_used);

  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-bold">{customer.name}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {customer.total_orders} total pemesanan
          </p>
        </div>
        <span className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm font-bold text-slate-950">
          <Gift className="h-4 w-4" />
          {reward.availableRewards}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <div>
          <dt className="text-slate-500">Reward</dt>
          <dd className="mt-1 font-bold">{reward.totalRewards}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Dipakai</dt>
          <dd className="mt-1 font-bold">{customer.rewards_used}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Tersedia</dt>
          <dd className="mt-1 font-bold">{reward.availableRewards}</dd>
        </div>
      </dl>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold transition-colors hover:border-primary hover:text-primary dark:border-slate-700"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onMarkUsed}
          disabled={reward.availableRewards < 1}
          className="inline-flex items-center justify-center gap-1 rounded-xl bg-primary px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Check className="h-4 w-4" />
          Pakai
        </button>
        <button
          type="button"
          onClick={onUndoUsed}
          disabled={customer.rewards_used < 1}
          className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700"
        >
          <Minus className="h-4 w-4" />
          Undo
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="col-span-2 inline-flex items-center justify-center gap-1 rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-red-600 transition-colors hover:border-red-500 hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950/40"
        >
          <Trash2 className="h-4 w-4" />
          Hapus customer
        </button>
      </div>
    </article>
  );
}
