"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  ChevronUp,
  ChevronsDown,
  Eye,
  EyeOff,
  Gift,
  History,
  Home,
  LogOut,
  Minus,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { getRewardStats } from "@/lib/rewards";
import { supabase } from "@/lib/supabase/client";
import type { Customer, LaundryCustomer, LaundryQueueItem } from "@/lib/supabase/types";
import {
  getSortedQueue,
  addQueueItem,
  updateQueueItemStatus,
  updateQueueItem,
  deleteQueueItem,
  generateQueueNumber,
  togglePaymentStatus,
  getHistoryQueue,
  getTotalActiveWeight,
  SortedQueueItem,
} from "./queueActions";
import {
  getLaundryCustomers,
  addLaundryCustomer,
  updateLaundryCustomer,
  deleteLaundryCustomer,
} from "./customerActions";

const INACTIVITY_TIMEOUT = 10 * 60 * 1000;

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export const Toast = MySwal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

export const showToast = (icon: "success" | "error" | "warning", title: string) => {
  Toast.fire({ icon, title });
};

export const confirmAction = async (title: string, text?: string, confirmText: string = "Ya, Hapus", isDanger: boolean = true) => {
  const result = await MySwal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: isDanger ? "#ef4444" : "#2563eb",
    cancelButtonColor: "#94a3b8",
    confirmButtonText: confirmText,
    cancelButtonText: "Batal",
    reverseButtons: true,
  });
  return result.isConfirmed;
};

// ── Utility Helpers ──────────────────────────────────────────────────────────

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta",
  });
}

// ── Customer Picker Dialog ────────────────────────────────────────────────────

function CustomerPickerDialog({
  onSelect,
  onClose,
  accessToken,
}: {
  onSelect: (customer: LaundryCustomer) => void;
  onClose: () => void;
  accessToken?: string;
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<LaundryCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Add form state
  const [addNama, setAddNama] = useState("");
  const [addKamar, setAddKamar] = useState("");
  const [addWa, setAddWa] = useState("");
  const [addError, setAddError] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchInputRef.current?.focus();
    doSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doSearch = useCallback(
    async (q: string) => {
      setIsLoading(true);
      const data = await getLaundryCustomers(q, accessToken);
      setResults(data);
      setIsLoading(false);
    },
    [accessToken]
  );

  useEffect(() => {
    const t = setTimeout(() => doSearch(search), 200);
    return () => clearTimeout(t);
  }, [search, doSearch]);

  const handleAddSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAddError("");
    if (!addNama.trim()) { setAddError("Nama pelanggan wajib diisi."); return; }
    setIsAdding(true);
    const res = await addLaundryCustomer(
      { nama: addNama.trim(), nomor_kamar: addKamar.trim() || undefined, nomor_wa: addWa.trim() || undefined },
      accessToken
    );
    if (res.success && res.customer) {
      onSelect(res.customer);
    } else {
      setAddError(res.error ?? "Gagal menambahkan pelanggan.");
      setIsAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/70 px-3 py-3 sm:items-center sm:px-4 sm:py-6">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        {/* Header */}
        <div className="sticky top-0 z-10 rounded-t-2xl bg-white px-5 pt-5 pb-4 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="font-[var(--font-display)] text-lg font-extrabold">Pilih Pelanggan</h3>
            <button type="button" onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 transition-colors hover:border-primary hover:text-primary dark:border-slate-700" aria-label="Tutup">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input ref={searchInputRef} type="search" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, nomor kamar, atau WA..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900" />
          </div>
        </div>

        {/* Results */}
        <div className="px-5 py-3">
          {isLoading ? (
            <div className="py-6 text-center text-sm text-slate-400">Mencari...</div>
          ) : results.length === 0 ? (
            <div className="py-4 text-center text-sm text-slate-400">
              Pelanggan tidak ditemukan.
            </div>
          ) : (
            <div className="grid gap-2">
              {results.map((c) => (
                <button key={c.id} type="button" onClick={() => onSelect(c)}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left transition-colors hover:border-primary hover:bg-primary/5 dark:border-slate-700 dark:hover:border-primary">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">{c.nama}</div>
                    <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-slate-500">
                      {c.nomor_kamar && <span className="flex items-center gap-1"><Home className="h-3 w-3" />{c.nomor_kamar}</span>}
                      {c.nomor_wa && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.nomor_wa}</span>}
                      {!c.nomor_kamar && !c.nomor_wa && <span className="text-slate-300 dark:text-slate-600">Tidak ada info tambahan</span>}
                    </div>
                  </div>
                  <Check className="h-4 w-4 flex-shrink-0 text-primary opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Add new customer section */}
        <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-800">
          {!showAddForm ? (
            <button type="button" onClick={() => { setShowAddForm(true); setAddNama(search.trim()); }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/5">
              <Plus className="h-4 w-4" />
              {search.trim() ? `Tambah pelanggan baru: "${search.trim()}"` : "Tambah Pelanggan Baru"}
            </button>
          ) : (
            <form onSubmit={handleAddSubmit} className="grid gap-3">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Tambah Pelanggan Baru</p>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600 dark:text-slate-400" htmlFor="picker-nama">Nama *</label>
                <input id="picker-nama" type="text" value={addNama} onChange={(e) => setAddNama(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary dark:border-slate-700 dark:bg-slate-950"
                  placeholder="Nama lengkap" required autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-600 dark:text-slate-400" htmlFor="picker-kamar">No. Kamar <span className="font-normal text-slate-400">(opsional)</span></label>
                  <input id="picker-kamar" type="text" value={addKamar} onChange={(e) => setAddKamar(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary dark:border-slate-700 dark:bg-slate-950"
                    placeholder="cth: 101" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-600 dark:text-slate-400" htmlFor="picker-wa">No. WA <span className="font-normal text-slate-400">(opsional)</span></label>
                  <input id="picker-wa" type="tel" value={addWa} onChange={(e) => setAddWa(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary dark:border-slate-700 dark:bg-slate-950"
                    placeholder="cth: 0812..." />
                </div>
              </div>
              {addError && <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40">{addError}</div>}
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAddForm(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold transition-colors hover:border-primary hover:text-primary dark:border-slate-700">Batal</button>
                <button type="submit" disabled={isAdding}
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-primary px-3 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-800 disabled:opacity-60">
                  <Check className="h-3.5 w-3.5" />{isAdding ? "Menyimpan..." : "Simpan & Pilih"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Manage Customers Panel ────────────────────────────────────────────────────

function ManageCustomersPanel({
  accessToken,
}: {
  accessToken?: string;
}) {
  const [customers, setCustomers] = useState<LaundryCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNama, setEditNama] = useState("");
  const [editKamar, setEditKamar] = useState("");
  const [editWa, setEditWa] = useState("");
  const [editError, setEditError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    const data = await getLaundryCustomers(undefined, accessToken);
    setCustomers(data);
    setIsLoading(false);
  }, [accessToken]);

  useEffect(() => {
    if (customers.length === 0) load();
  }, [load, customers.length]);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.nama.toLowerCase().includes(q) ||
        (c.nomor_kamar ?? "").toLowerCase().includes(q) ||
        (c.nomor_wa ?? "").toLowerCase().includes(q)
    );
  }, [customers, search]);

  const startEdit = (c: LaundryCustomer) => {
    setEditingId(c.id);
    setEditNama(c.nama);
    setEditKamar(c.nomor_kamar ?? "");
    setEditWa(c.nomor_wa ?? "");
    setEditError("");
  };

  const cancelEdit = () => { setEditingId(null); setEditError(""); };

  const handleSaveEdit = async (id: string) => {
    setEditError("");
    if (!editNama.trim()) { setEditError("Nama wajib diisi."); return; }
    setIsSaving(true);
    const res = await updateLaundryCustomer(id, {
      nama: editNama, nomor_kamar: editKamar || undefined, nomor_wa: editWa || undefined,
    }, accessToken);
    if (res.success) {
      showToast("success", "Data pelanggan berhasil diperbarui.");
      setEditingId(null);
      await load();
    } else {
      setEditError(res.error ?? "Gagal menyimpan.");
    }
    setIsSaving(false);
  };

  const handleDelete = async (c: LaundryCustomer) => {
    const isConfirmed = await confirmAction(`Hapus pelanggan ${c.nama}?`, "Antrean yang terkait tidak akan terhapus.", "Ya, Hapus", true);
    if (!isConfirmed) return;
    const res = await deleteLaundryCustomer(c.id, accessToken);
    if (res.success) {
      showToast("success", `Pelanggan ${c.nama} berhasil dihapus.`);
      await load();
    } else {
      showToast("error", `Gagal menghapus: ${res.error}`);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-bold border-b border-slate-100 dark:border-slate-800">
        <span className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Master Pelanggan Laundry
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{customers.length > 0 ? customers.length : "..."}</span>
        </span>
      </div>

      <div>
        <div className="flex gap-3 p-4">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari pelanggan..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none transition-colors focus:border-primary focus:bg-white dark:border-slate-700 dark:bg-slate-800" />
            </div>
            <button type="button" onClick={load}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold transition-colors hover:border-primary hover:text-primary dark:border-slate-700">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          {isLoading ? (
            <div className="px-5 py-6 text-center text-sm text-slate-400">Memuat...</div>
          ) : filtered.length === 0 ? (
            <div className="px-5 pb-6 text-center text-sm text-slate-400">Belum ada pelanggan terdaftar.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-bold">Nama</th>
                    <th className="px-5 py-3 font-bold">No. Kamar</th>
                    <th className="px-5 py-3 font-bold">No. WA</th>
                    <th className="px-5 py-3 font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map((c) =>
                    editingId === c.id ? (
                      <tr key={c.id} className="bg-primary/5">
                        <td className="px-4 py-2">
                          <input value={editNama} onChange={(e) => setEditNama(e.target.value)}
                            className="w-full rounded-lg border border-primary px-2.5 py-1.5 text-sm outline-none" autoFocus />
                          {editError && <p className="mt-1 text-xs text-red-500">{editError}</p>}
                        </td>
                        <td className="px-4 py-2">
                          <input value={editKamar} onChange={(e) => setEditKamar(e.target.value)}
                            placeholder="—" className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-primary dark:border-slate-700" />
                        </td>
                        <td className="px-4 py-2">
                          <input value={editWa} onChange={(e) => setEditWa(e.target.value)}
                            placeholder="—" className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-primary dark:border-slate-700" />
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex gap-1.5">
                            <button type="button" onClick={() => handleSaveEdit(c.id)} disabled={isSaving}
                              className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-60">
                              <Check className="h-3 w-3" />{isSaving ? "..." : "Simpan"}
                            </button>
                            <button type="button" onClick={cancelEdit}
                              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold hover:border-primary dark:border-slate-700">Batal</button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-3 font-bold">{c.nama}</td>
                        <td className="px-5 py-3 text-sm text-slate-500">{c.nomor_kamar ?? <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                        <td className="px-5 py-3 text-sm text-slate-500">{c.nomor_wa ?? <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                        <td className="px-5 py-3">
                          <div className="flex gap-2">
                            <button type="button" onClick={() => startEdit(c)} title="Edit"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-primary hover:text-primary dark:border-slate-700">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => handleDelete(c)} title="Hapus"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950/40">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

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

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [totalOrders, setTotalOrders] = useState("");
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [showLoyalty, setShowLoyalty] = useState(true);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [activeTab, setActiveTab] = useState<"loyalty" | "customers" | "queue" | "history">("loyalty");

  // Queue States
  const [queueItems, setQueueItems] = useState<SortedQueueItem[]>([]);
  const [isQueueLoading, setIsQueueLoading] = useState(false);
  const [sdmCount, setSdmCount] = useState(3);
  const [isQueueDialogOpen, setIsQueueDialogOpen] = useState(false);
  const [queueDialogMode, setQueueDialogMode] = useState<"add" | "edit">("add");
  const [selectedQueueItem, setSelectedQueueItem] = useState<SortedQueueItem | null>(null);

  // Queue form fields
  const [queueNoAntrean, setQueueNoAntrean] = useState("");
  const [selectedLaundryCustomer, setSelectedLaundryCustomer] = useState<LaundryCustomer | null>(null);
  const [queueLayanan, setQueueLayanan] = useState<"Reguler" | "Express" | "Extra Express">("Reguler");
  const [queueBerat, setQueueBerat] = useState("");
  const [queueFormError, setQueueFormError] = useState("");
  const [isQueueSaving, setIsQueueSaving] = useState(false);

  // Customer picker dialog
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // History
  const [historyItems, setHistoryItems] = useState<LaundryQueueItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyHasMore, setHistoryHasMore] = useState(false);

  const filteredLoyaltyCustomers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return customers.slice(0, 8);
    return customers.filter((c) => c.name.toLowerCase().includes(query)).slice(0, 8);
  }, [customers, searchTerm]);

  const totals = useMemo(() => customers.reduce(
    (s, c) => {
      const r = getRewardStats(c.total_orders, c.rewards_used);
      return { orders: s.orders + c.total_orders, available: s.available + r.availableRewards };
    },
    { orders: 0, available: 0 }
  ), [customers]);

  // ── Loaders ──────────────────────────────────────────────────────────────

  const loadCustomers = async () => {
    setIsCustomersLoading(true);
    setCustomersError("");
    const { data, error } = await supabase.from("customers").select("*").order("name", { ascending: true });
    if (error) { setCustomers([]); setCustomersError("Data pembeli belum bisa dimuat."); }
    else setCustomers(data ?? []);
    setIsCustomersLoading(false);
  };

  const loadSettings = async () => {
    const { data: ld } = await supabase.from("site_settings").select("value").eq("key", "show_loyalty").single();
    if (ld) setShowLoyalty(ld.value === "true");
    const { data: sd } = await supabase.from("site_settings").select("value").eq("key", "sdm_count").single();
    if (sd) setSdmCount(Number(sd.value));
  };

  const loadQueue = useCallback(async () => {
    setIsQueueLoading(true);
    try {
      const data = await getSortedQueue(sdmCount, session?.access_token);
      setQueueItems(data);
    } catch { showToast("error", "Gagal memuat antrean laundry."); }
    finally { setIsQueueLoading(false); }
  }, [sdmCount, session?.access_token]);

  const loadHistory = async (page: number, append = false) => {
    setIsHistoryLoading(true);
    try {
      const { items, hasMore } = await getHistoryQueue(page, session?.access_token);
      setHistoryItems((prev) => (append ? [...prev, ...items] : items));
      setHistoryHasMore(hasMore);
      setHistoryPage(page);
    } catch { /* silently fail */ }
    finally { setIsHistoryLoading(false); }
  };

  const updateSdmCount = async (val: number) => {
    setSdmCount(val);
    await supabase.from("site_settings").update({ value: String(val) }).eq("key", "sdm_count");
  };

  const toggleLoyalty = async () => {
    const next = !showLoyalty;
    const { error } = await supabase.from("site_settings").update({ value: String(next) }).eq("key", "show_loyalty");
    if (!error) {
      setShowLoyalty(next);
      showToast("success", next ? "Customer Loyalty ditampilkan di dashboard publik." : "Customer Loyalty disembunyikan dari dashboard publik.");
    } else showToast("error", "Gagal mengubah pengaturan.");
  };

  // ── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setIsAuthLoading(false);
    };
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) { loadCustomers(); loadSettings(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => {
    if (session && activeTab === "queue") loadQueue();
    if (session && activeTab === "history") loadHistory(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, session]);

  useEffect(() => {
    if (session && activeTab === "queue") loadQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdmCount]);

  useEffect(() => {
    if (!session) return;
    const reset = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(async () => {
        await supabase.auth.signOut();
        setCustomers([]);
      }, INACTIVITY_TIMEOUT);
    };
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [session]);

  // ── Auth ──────────────────────────────────────────────────────────────────

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSigningIn(true);
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(`Gagal login: ${error.message}`);
    setIsSigningIn(false);
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); setCustomers([]); };

  // ── Loyalty Customer Handlers ─────────────────────────────────────────────

  const openCustomerDialog = () => {
    setSearchTerm(""); setSelectedCustomer(null); setCustomerName(""); setTotalOrders(""); setFormError(""); setDialogMode("add"); setIsDialogOpen(true);
  };
  const openEditDialog = (customer: Customer) => {
    setSelectedCustomer(customer); setCustomerName(customer.name); setTotalOrders(String(customer.total_orders)); setFormError(""); setDialogMode("edit"); setIsDialogOpen(true);
  };
  const closeCustomerDialog = () => { if (!isSaving) setIsDialogOpen(false); };
  const chooseCustomer = (c: Customer) => { setSelectedCustomer(c); setCustomerName(c.name); setTotalOrders(String(c.total_orders)); setFormError(""); };
  const startNewCustomer = () => { setSelectedCustomer(null); setCustomerName(searchTerm.trim()); setTotalOrders("0"); setFormError(""); };

  const saveCustomer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    const cleanName = customerName.trim();
    const parsedOrders = Number(totalOrders);
    if (!cleanName) { setFormError("Nama pembeli wajib diisi."); return; }
    if (!Number.isInteger(parsedOrders) || parsedOrders < 0) { setFormError("Total pemesanan harus angka bulat minimal 0."); return; }
    if (selectedCustomer && parsedOrders < selectedCustomer.rewards_used * 5) { setFormError("Total pemesanan tidak boleh lebih kecil dari reward yang sudah dipakai."); return; }
    setIsSaving(true);
    const res = selectedCustomer
      ? await supabase.from("customers").update({ name: cleanName, total_orders: parsedOrders }).eq("id", selectedCustomer.id).select().single()
      : await supabase.from("customers").insert({ name: cleanName, total_orders: parsedOrders, rewards_used: 0 }).select().single();
    if (res.error) {
      setFormError(res.error.code === "23505" ? "Nama sudah ada. Pilih nama tersebut dari hasil pencarian." : "Data belum bisa disimpan.");
      setIsSaving(false); return;
    }
    await loadCustomers();
    showToast("success", "Data pembeli berhasil disimpan.");
    setIsSaving(false); setIsDialogOpen(false);
  };

  const markRewardUsed = async (c: Customer) => {
    const r = getRewardStats(c.total_orders, c.rewards_used);
    if (r.availableRewards < 1) return;
    const { error } = await supabase.from("customers").update({ rewards_used: c.rewards_used + 1 }).eq("id", c.id);
    if (error) { showToast("error", "Reward belum bisa ditandai."); return; }
    showToast("success", `Reward ${c.name} ditandai sudah dipakai.`);
    await loadCustomers();
  };

  const undoRewardUsed = async (c: Customer) => {
    if (c.rewards_used < 1) return;
    const { error } = await supabase.from("customers").update({ rewards_used: c.rewards_used - 1 }).eq("id", c.id);
    if (error) { showToast("error", "Status reward belum bisa dikembalikan."); return; }
    showToast("success", `Pemakaian reward ${c.name} dikurangi.`);
    await loadCustomers();
  };

  const deleteCustomer = async (c: Customer) => {
    const isConfirmed = await confirmAction(`Hapus data ${c.name}?`, undefined, "Ya, Hapus", true);
    if (!isConfirmed) return;
    const { error } = await supabase.from("customers").delete().eq("id", c.id);
    if (error) { showToast("error", "Customer belum bisa dihapus."); return; }
    showToast("success", `Customer ${c.name} berhasil dihapus.`);
    await loadCustomers();
  };

  // ── Queue Handlers ────────────────────────────────────────────────────────

  const openAddQueueDialog = async () => {
    setSelectedLaundryCustomer(null);
    setQueueLayanan("Reguler");
    setQueueBerat("");
    setQueueFormError("");
    setQueueDialogMode("add");
    setSelectedQueueItem(null);
    setIsQueueDialogOpen(true);
    const nextNo = await generateQueueNumber(session?.access_token);
    setQueueNoAntrean(nextNo);
  };

  const openEditQueueDialog = (item: SortedQueueItem) => {
    setSelectedQueueItem(item);
    setQueueNoAntrean(item.no_antrean);
    setSelectedLaundryCustomer(item.laundry_customers ?? null);
    setQueueLayanan(item.jenis_layanan);
    setQueueBerat(String(item.berat));
    setQueueFormError("");
    setQueueDialogMode("edit");
    setIsQueueDialogOpen(true);
  };

  const handlePickerSelect = (c: LaundryCustomer) => {
    setSelectedLaundryCustomer(c);
    setIsPickerOpen(false);
  };

  const handleSaveQueueItem = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setQueueFormError("");
    if (!selectedLaundryCustomer) { setQueueFormError("Pelanggan belum dipilih. Klik tombol Pilih Pelanggan."); return; }
    const parsedWeight = parseFloat(queueBerat);
    if (isNaN(parsedWeight) || parsedWeight <= 0) { setQueueFormError("Berat harus berupa angka positif."); return; }

    // --- Extreme Capacity Handling ---
    let finalLayanan = queueLayanan;
    const activeBacklogWeight = await getTotalActiveWeight(session?.access_token);
    const totalLoad = activeBacklogWeight + parsedWeight;
    const dailyCapacity = sdmCount * 10;
    const daysRequired = Math.ceil(totalLoad / dailyCapacity);
    
    let maxDays = 3;
    if (queueLayanan === "Extra Express") maxDays = 1;
    else if (queueLayanan === "Express") maxDays = 2;

    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + Math.max(1, daysRequired)); // At least 1 day

    if (daysRequired > maxDays) {
      let suggestedLayanan = "Reguler";
      if (daysRequired <= 1) suggestedLayanan = "Extra Express";
      else if (daysRequired === 2) suggestedLayanan = "Express";
      
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const dateStr = expectedDate.toLocaleDateString('id-ID', options);

      const title = "Peringatan Kapasitas!";
      const text = `Ada ${activeBacklogWeight} kg antrean aktif. Dengan pesanan baru ${parsedWeight} kg (Total: ${totalLoad} kg), butuh waktu ${daysRequired} hari dengan ${sdmCount} SDM aktif. Ekspektasi selesai pada ${dateStr}.\n\nApakah Anda setuju menyesuaikan jenis layanan menjadi ${suggestedLayanan}?`;
      
      const result = await MySwal.fire({
        title,
        text,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#2563eb",
        cancelButtonColor: "#ef4444",
        confirmButtonText: "Ya, Setuju",
        cancelButtonText: "Tidak, Batal",
        reverseButtons: true,
      });

      if (!result.isConfirmed) {
        return; // Transaksi dibatalkan
      }
      finalLayanan = suggestedLayanan as "Reguler" | "Express" | "Extra Express";
    }
    // ---------------------------------

    setIsQueueSaving(true);

    const payload = {
      customer_id: selectedLaundryCustomer.id,
      nama_pelanggan: selectedLaundryCustomer.nama,
      jenis_layanan: finalLayanan,
      berat: parsedWeight,
      estimasi_selesai: expectedDate.toISOString(),
    };

    const res = selectedQueueItem
      ? await updateQueueItem(selectedQueueItem.id, payload, session?.access_token)
      : await addQueueItem(payload, session?.access_token);

    if (res.success) {
      const noStr = "no_antrean" in res && res.no_antrean ? ` (${res.no_antrean})` : "";
      showToast("success", selectedQueueItem ? "Item antrean berhasil diperbarui." : `Antrean baru berhasil ditambahkan${noStr}.`);
      await loadQueue();
      setIsQueueDialogOpen(false);
    } else {
      setQueueFormError(res.error || "Gagal menyimpan item antrean.");
    }
    setIsQueueSaving(false);
  };

  const handleUpdateQueueStatus = async (item: SortedQueueItem, status: "pending" | "proses" | "selesai") => {
    if (status === "selesai" && !item.sudah_bayar) {
      showToast("warning", `⚠️ ${item.nama_pelanggan} belum bayar. Tandai lunas terlebih dahulu sebelum menyelesaikan.`);
      return;
    }

    const isConfirmed = await confirmAction(`Ubah status ke ${status}?`, undefined, "Ya, Ubah", false);
    if (!isConfirmed) return;

    const res = await updateQueueItemStatus(item.id, status, session?.access_token);
    if (res.success) { showToast("success", `Status ${item.nama_pelanggan} → ${status}.`); await loadQueue(); }
    else showToast("error", `Gagal memperbarui status: ${res.error}`);
  };

  const handleTogglePayment = async (item: SortedQueueItem) => {
    const next = !item.sudah_bayar;
    const isConfirmed = await confirmAction(next ? `Tandai cucian ${item.nama_pelanggan} sudah lunas?` : `Batalkan status lunas untuk ${item.nama_pelanggan}?`, undefined, next ? "Ya, Tandai Lunas" : "Ya, Batalkan Lunas", !next);
    if (!isConfirmed) return;
    const res = await togglePaymentStatus(item.id, next, session?.access_token);
    if (res.success) { showToast("success", next ? `${item.nama_pelanggan} ditandai sudah bayar.` : `${item.nama_pelanggan} ditandai belum bayar.`); await loadQueue(); }
    else showToast("error", `Gagal mengubah status bayar: ${res.error}`);
  };

  const handleDeleteQueueItem = async (id: string, nama: string) => {
    const isConfirmed = await confirmAction(`Hapus antrean untuk ${nama}?`, undefined, "Ya, Hapus", true);
    if (!isConfirmed) return;
    const res = await deleteQueueItem(id, session?.access_token);
    if (res.success) { showToast("success", `Antrean ${nama} berhasil dihapus.`); await loadQueue(); }
    else showToast("error", `Gagal menghapus: ${res.error}`);
  };

  const handleDeleteHistoryItem = async (id: string, nama: string) => {
    const isConfirmed = await confirmAction(`Hapus riwayat laundry untuk ${nama}?`, undefined, "Ya, Hapus", true);
    if (!isConfirmed) return;
    const res = await deleteQueueItem(id, session?.access_token);
    if (res.success) { setHistoryItems((prev) => prev.filter((i) => i.id !== id)); showToast("success", `Riwayat ${nama} dihapus.`); }
    else showToast("error", `Gagal menghapus: ${res.error}`);
  };

  // ── Loading / Auth Screens ─────────────────────────────────────────────────

  if (isAuthLoading) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">Memeriksa sesi admin...</main>;
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 sm:py-10">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center">
          <form onSubmit={handleSignIn} className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <span className="text-xs font-bold uppercase tracking-widest text-primary sm:text-sm">Admin Qosama</span>
            <h1 className="mt-3 font-[var(--font-display)] text-2xl font-extrabold sm:text-3xl">Login admin</h1>
            <label className="mt-8 block text-sm font-bold" htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition-colors focus:border-primary dark:border-slate-700 dark:bg-slate-950" required />
            <label className="mt-5 block text-sm font-bold" htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition-colors focus:border-primary dark:border-slate-700 dark:bg-slate-950" required />
            {authError && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40">{authError}</div>}
            <button type="submit" disabled={isSigningIn}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white transition-colors hover:bg-blue-800 disabled:opacity-60">
              <Check className="h-4 w-4" />{isSigningIn ? "Masuk..." : "Masuk"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // ── Main UI ────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary sm:text-sm">Panel Admin Qosama</span>
            <h1 className="mt-2 font-[var(--font-display)] text-2xl font-extrabold leading-tight sm:text-4xl">
              {activeTab === "loyalty" ? "Kelola pembeli dan reward" : activeTab === "customers" ? "Master Pelanggan Laundry" : activeTab === "queue" ? "Sistem Antrean Cerdas Laundry" : "Riwayat Laundry Selesai"}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Link href="/" className="inline-flex flex-1 sm:flex-none min-w-[120px] items-center justify-center rounded-xl border border-slate-200 px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-bold transition-colors hover:border-primary hover:text-primary dark:border-slate-800">Dashboard</Link>
            <button type="button" onClick={toggleLoyalty}
              className={`inline-flex flex-1 sm:flex-none min-w-[120px] items-center justify-center gap-1.5 sm:gap-2 rounded-xl border px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-bold transition-colors ${showLoyalty ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400" : "border-slate-200 text-slate-500 hover:border-primary hover:text-primary dark:border-slate-700"}`}>
              {showLoyalty ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}{showLoyalty ? "Loyalty ON" : "Loyalty OFF"}
            </button>
            <button type="button" onClick={handleSignOut}
              className="inline-flex flex-1 sm:flex-none min-w-[120px] items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-slate-900 px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-bold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-950">
              <LogOut className="h-4 w-4" />Keluar
            </button>
          </div>
        </header>

        {/* Tabs */}
        {/* Tabs */}
        <div className="mb-8">
          <div className="flex overflow-x-auto gap-2 rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-900 sm:inline-flex hide-scrollbar">
            {(["loyalty", "customers", "queue", "history"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition-all outline-none flex-1 sm:flex-none ${activeTab === tab ? "bg-white text-primary shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 dark:hover:text-white dark:hover:bg-slate-800/50"}`}>
                {tab === "loyalty" ? "Loyalty & Rewards" : tab === "customers" ? "Pelanggan" : tab === "queue" ? "Antrean Laundry" : "Riwayat"}
              </button>
            ))}
          </div>
        </div>

        {/* ── TAB: LOYALTY ── */}
        {activeTab === "loyalty" && (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <AdminMetric label="Total pembeli" value={customers.length} />
              <AdminMetric label="Total pemesanan" value={totals.orders} />
              <AdminMetric label="Reward tersedia" value={totals.available} />
            </div>
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-slate-500 dark:text-slate-400">Login sebagai {session.user.email}</div>
              <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                <button type="button" onClick={loadCustomers} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold transition-colors hover:border-primary hover:text-primary dark:border-slate-800"><RefreshCw className="h-4 w-4" />Muat ulang</button>
                <button type="button" onClick={openCustomerDialog} className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-yellow-300"><Plus className="h-4 w-4" />Input pembeli</button>
              </div>
            </div>

            {customersError && <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40">{customersError}</div>}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {isCustomersLoading ? <div className="px-5 py-10 text-center text-slate-500">Memuat data...</div>
                : customers.length === 0 ? <div className="px-5 py-10 text-center text-slate-500">Belum ada pembeli. Mulai dari tombol Input pembeli.</div>
                : (
                  <div>
                    <div className="grid gap-3 p-3 md:hidden">
                      {customers.map((c) => <AdminCustomerCard key={c.id} customer={c} onEdit={() => openEditDialog(c)} onMarkUsed={() => markRewardUsed(c)} onUndoUsed={() => undoRewardUsed(c)} onDelete={() => deleteCustomer(c)} />)}
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
                          {customers.map((c) => {
                            const r = getRewardStats(c.total_orders, c.rewards_used);
                            return (
                              <tr key={c.id}>
                                <td className="px-5 py-4 font-bold">{c.name}</td>
                                <td className="px-5 py-4">{c.total_orders}</td>
                                <td className="px-5 py-4">{r.totalRewards}</td>
                                <td className="px-5 py-4">{c.rewards_used}</td>
                                <td className="px-5 py-4"><span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm font-bold text-slate-950"><Gift className="h-4 w-4" />{r.availableRewards}</span></td>
                                <td className="px-5 py-4">
                                  <div className="flex flex-wrap gap-2">
                                    <button type="button" onClick={() => openEditDialog(c)} title="Edit" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:border-primary hover:text-primary dark:border-slate-700"><Pencil className="h-4 w-4" /></button>
                                    <button type="button" onClick={() => markRewardUsed(c)} disabled={r.availableRewards < 1} className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"><Check className="h-4 w-4" />Pakai</button>
                                    <button type="button" onClick={() => undoRewardUsed(c)} disabled={c.rewards_used < 1} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold transition-colors hover:border-primary hover:text-primary disabled:opacity-50 dark:border-slate-700"><Minus className="h-4 w-4" />Undo</button>
                                    <button type="button" onClick={() => deleteCustomer(c)} title="Hapus" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 text-red-600 transition-colors hover:border-red-500 hover:bg-red-50 dark:border-red-900/60"><Trash2 className="h-4 w-4" /></button>
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
          </>
        )}

        {/* ── TAB: QUEUE ── */}
        {activeTab === "queue" && (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:text-sm">Jumlah SDM Aktif</span>
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <span className="font-[var(--font-display)] text-3xl font-extrabold text-primary">{sdmCount}</span>
                  <input type="range" min="1" max="5" step="1" value={sdmCount} onChange={(e) => updateSdmCount(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer rounded-lg bg-slate-200 accent-primary dark:bg-slate-700" />
                </div>
                <p className="mt-2 text-xs text-slate-400">Gunakan slider untuk mengatur SDM aktif hari ini.</p>
              </div>
              <AdminMetric label="Antrean Pending & Proses" value={queueItems.length} />
              <AdminMetric label="Berat Total Antrean (Kg)" value={Number(queueItems.reduce((a, i) => a + i.berat, 0).toFixed(1))} />
            </div>

            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-slate-500 dark:text-slate-400">Inference berjalan real-time via ONNX Runtime</div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={loadQueue} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold transition-colors hover:border-primary hover:text-primary dark:border-slate-800"><RefreshCw className="h-4 w-4" />Muat ulang</button>
                <button type="button" onClick={() => setActiveTab("history")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold transition-colors hover:border-primary hover:text-primary dark:border-slate-800"><History className="h-4 w-4" />Lihat Riwayat</button>
                <button type="button" onClick={openAddQueueDialog} className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-yellow-300"><Plus className="h-4 w-4" />Tambah antrean</button>
              </div>
            </div>



            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {isQueueLoading ? <div className="px-5 py-10 text-center text-slate-500">Memproses klasifikasi prioritas...</div>
                : queueItems.length === 0 ? <div className="px-5 py-10 text-center text-slate-500">Belum ada cucian dalam antrean aktif.</div>
                : (
                  <div>
                    <div className="grid gap-3 p-3 md:hidden">
                      {queueItems.map((item) => (
                        <AdminQueueCard key={item.id} item={item}
                          onEdit={() => openEditQueueDialog(item)}
                          onUpdateStatus={(s) => handleUpdateQueueStatus(item, s)}
                          onTogglePayment={() => handleTogglePayment(item)}
                          onDelete={() => handleDeleteQueueItem(item.id, item.nama_pelanggan)} />
                      ))}
                    </div>
                    <div className="hidden overflow-x-auto md:block">
                      <table className="w-full min-w-[1100px] text-left">
                        <thead className="bg-slate-100 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          <tr>
                            <th className="px-4 py-4 font-bold text-center">Urutan</th>
                            <th className="px-4 py-4 font-bold">No Antrean</th>
                            <th className="px-4 py-4 font-bold">Nama</th>
                            <th className="px-4 py-4 font-bold">Kamar / WA</th>
                            <th className="px-4 py-4 font-bold">Layanan</th>
                            <th className="px-4 py-4 font-bold">Berat</th>
                            <th className="px-4 py-4 font-bold">Sisa Hari</th>
                            <th className="px-4 py-4 font-bold">Prioritas</th>
                            <th className="px-4 py-4 font-bold">Tgl Masuk</th>
                            <th className="px-4 py-4 font-bold">Mulai Proses</th>
                            <th className="px-4 py-4 font-bold">Bayar</th>
                            <th className="px-4 py-4 font-bold">Status</th>
                            <th className="px-4 py-4 font-bold text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          {queueItems.map((item) => {
                            const lc = item.laundry_customers;
                            const sisaHari = item.sisaHariSorting;
                            let sisaHariText = `${sisaHari} hari`, sisaHariColor = "text-emerald-600 dark:text-emerald-400";
                            if (sisaHari < 0) { sisaHariText = `Terlambat ${Math.abs(sisaHari)} hari`; sisaHariColor = "text-rose-600 dark:text-rose-400 font-bold"; }
                            else if (sisaHari === 0) { sisaHariText = "Hari ini"; sisaHariColor = "text-amber-600 dark:text-amber-400 font-bold"; }
                            else if (sisaHari === 1) sisaHariText = "Besok";
                            let prioColor = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
                            if (item.predictedPriority === "Prioritas Tinggi") prioColor = "bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-400";
                            else if (item.predictedPriority === "Prioritas Sedang") prioColor = "bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-400";
                            else if (item.predictedPriority === "Prioritas Rendah") prioColor = "bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-400";
                            let layananColor = "text-blue-600 dark:text-blue-400";
                            if (item.jenis_layanan === "Express") layananColor = "text-amber-600 dark:text-amber-400";
                            else if (item.jenis_layanan === "Extra Express") layananColor = "text-rose-600 dark:text-rose-400 font-bold";

                            return (
                              <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                <td className="px-4 py-3 text-center"><span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-white text-sm">{item.workOrder}</span></td>
                                <td className="px-4 py-3 font-mono font-bold text-xs text-slate-600 dark:text-slate-400">{item.no_antrean}</td>
                                <td className="px-4 py-3 font-bold">{item.nama_pelanggan}</td>
                                <td className="px-4 py-3 text-xs text-slate-500">
                                  {lc?.nomor_kamar && <div className="flex items-center gap-1"><Home className="h-3 w-3" />{lc.nomor_kamar}</div>}
                                  {lc?.nomor_wa && <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{lc.nomor_wa}</div>}
                                  {!lc?.nomor_kamar && !lc?.nomor_wa && <span className="text-slate-300 dark:text-slate-600">—</span>}
                                </td>
                                <td className="px-4 py-3"><span className={`font-semibold ${layananColor}`}>{item.jenis_layanan}</span></td>
                                <td className="px-4 py-3 font-medium">{item.berat} Kg</td>
                                <td className="px-4 py-3"><span className={`flex items-center gap-1 ${sisaHariColor}`}>{sisaHari < 0 && <ShieldAlert className="h-4 w-4 flex-shrink-0" />}{sisaHariText}</span></td>
                                <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${prioColor}`}>{item.predictedPriority}</span></td>
                                <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(item.tanggal_masuk)}</td>
                                <td className="px-4 py-3 text-xs text-slate-500">{item.waktu_proses ? formatDateTime(item.waktu_proses) : <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                                <td className="px-4 py-3">
                                  <button type="button" onClick={() => handleTogglePayment(item)}
                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${item.sudah_bayar ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400" : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/40"}`}>
                                    <Wallet className="h-3 w-3" />{item.sudah_bayar ? "Lunas" : "Belum Bayar"}
                                  </button>
                                </td>
                                <td className="px-4 py-3">
                                  <select value={item.status} onChange={(e) => handleUpdateQueueStatus(item, e.target.value as "pending" | "proses" | "selesai")}
                                    className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-bold outline-none dark:border-slate-700 dark:bg-slate-950">
                                    <option value="pending">Pending</option>
                                    <option value="proses">Proses</option>
                                    <option value="selesai">Selesai</option>
                                  </select>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="inline-flex gap-2">
                                    <button type="button" onClick={() => openEditQueueDialog(item)} title="Edit" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:border-primary hover:text-primary dark:border-slate-700"><Pencil className="h-4 w-4" /></button>
                                    <button type="button" onClick={() => handleDeleteQueueItem(item.id, item.nama_pelanggan)} title="Hapus" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 text-red-600 transition-colors hover:border-red-500 hover:bg-red-50 dark:border-red-900/60"><Trash2 className="h-4 w-4" /></button>
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

          </>
        )}

        {/* ── TAB: CUSTOMERS ── */}
        {activeTab === "customers" && (
          <ManageCustomersPanel accessToken={session?.access_token} />
        )}

        {/* ── TAB: HISTORY ── */}
        {activeTab === "history" && (
          <>
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-slate-500 dark:text-slate-400">Laundry selesai — {historyItems.length} item ditampilkan</div>
              <button type="button" onClick={() => loadHistory(0)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold transition-colors hover:border-primary hover:text-primary dark:border-slate-800"><RefreshCw className="h-4 w-4" />Muat ulang</button>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {isHistoryLoading && historyItems.length === 0 ? <div className="px-5 py-10 text-center text-slate-500">Memuat riwayat laundry...</div>
                : historyItems.length === 0 ? <div className="px-5 py-10 text-center text-slate-500">Belum ada laundry yang selesai.</div>
                : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] text-left">
                      <thead className="bg-slate-100 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        <tr>
                          <th className="px-4 py-4 font-bold">No Antrean</th>
                          <th className="px-4 py-4 font-bold">Nama</th>
                          <th className="px-4 py-4 font-bold">Kamar / WA</th>
                          <th className="px-4 py-4 font-bold">Layanan</th>
                          <th className="px-4 py-4 font-bold">Berat</th>
                          <th className="px-4 py-4 font-bold">Tgl Masuk</th>
                          <th className="px-4 py-4 font-bold">Mulai Proses</th>
                          <th className="px-4 py-4 font-bold">Selesai Pada</th>
                          <th className="px-4 py-4 font-bold">Bayar</th>
                          <th className="px-4 py-4 font-bold">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {historyItems.map((item) => {
                          const lc = item.laundry_customers;
                          return (
                            <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                              <td className="px-4 py-3 font-mono font-bold text-xs text-slate-600 dark:text-slate-400">{item.no_antrean}</td>
                              <td className="px-4 py-3 font-bold">{item.nama_pelanggan}</td>
                              <td className="px-4 py-3 text-xs text-slate-500">
                                {lc?.nomor_kamar && <div className="flex items-center gap-1"><Home className="h-3 w-3" />{lc.nomor_kamar}</div>}
                                {lc?.nomor_wa && <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{lc.nomor_wa}</div>}
                                {!lc?.nomor_kamar && !lc?.nomor_wa && <span className="text-slate-300 dark:text-slate-600">—</span>}
                              </td>
                              <td className="px-4 py-3 text-sm">{item.jenis_layanan}</td>
                              <td className="px-4 py-3 text-sm">{item.berat} Kg</td>
                              <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(item.tanggal_masuk)}</td>
                              <td className="px-4 py-3 text-xs text-slate-500">{item.waktu_proses ? formatDateTime(item.waktu_proses) : <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                              <td className="px-4 py-3 text-xs"><span className="font-bold text-emerald-600 dark:text-emerald-400">{formatDateTime(item.waktu_selesai)}</span></td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${item.sudah_bayar ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" : "bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/40 dark:text-red-400"}`}>
                                  <Wallet className="h-3 w-3" />{item.sudah_bayar ? "Lunas" : "Belum Bayar"}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <button type="button" onClick={() => handleDeleteHistoryItem(item.id, item.nama_pelanggan)} title="Hapus"
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 text-red-600 transition-colors hover:border-red-500 hover:bg-red-50 dark:border-red-900/60">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
            {historyHasMore && (
              <div className="mt-4 flex justify-center">
                <button type="button" onClick={() => loadHistory(historyPage + 1, true)} disabled={isHistoryLoading}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold transition-colors hover:border-primary hover:text-primary disabled:opacity-50 dark:border-slate-700">
                  <ChevronsDown className="h-4 w-4" />{isHistoryLoading ? "Memuat..." : "Muat lebih banyak"}
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Dialog: Customer Loyalty ── */}
        {isDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 px-3 py-3 sm:items-center sm:px-4 sm:py-6">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl dark:bg-slate-900 sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-primary sm:text-sm">{dialogMode === "add" ? "Input manual" : "Edit data"}</span>
                  <h2 className="mt-2 font-[var(--font-display)] text-xl font-extrabold sm:text-2xl">{dialogMode === "add" ? "Cari atau tambah pembeli" : "Edit data pembeli"}</h2>
                </div>
                <button type="button" onClick={closeCustomerDialog} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 transition-colors hover:border-primary hover:text-primary dark:border-slate-700" aria-label="Tutup dialog"><X className="h-4 w-4" /></button>
              </div>
              {dialogMode === "add" && (
                <>
                  <div className="mb-5">
                    <label className="mb-2 block text-sm font-bold" htmlFor="search">Cari nama pembeli</label>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input id="search" type="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Ketik nama pembeli"
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 outline-none transition-colors focus:border-primary dark:border-slate-700 dark:bg-slate-950" />
                    </div>
                  </div>
                  <div className="mb-5 grid gap-2">
                    {filteredLoyaltyCustomers.map((c) => (
                      <button key={c.id} type="button" onClick={() => chooseCustomer(c)}
                        className={`flex flex-col gap-1 rounded-xl border px-4 py-3 text-left transition-colors sm:flex-row sm:items-center sm:justify-between ${selectedCustomer?.id === c.id ? "border-primary bg-primary/10" : "border-slate-200 hover:border-primary dark:border-slate-700"}`}>
                        <span className="font-bold">{c.name}</span>
                        <span className="text-sm text-slate-500">{c.total_orders} pemesanan</span>
                      </button>
                    ))}
                    {searchTerm.trim() && !selectedCustomer && (
                      <button type="button" onClick={startNewCustomer}
                        className="rounded-xl border border-dashed border-primary px-4 py-3 text-left font-bold text-primary">Tambah nama baru: {searchTerm.trim()}</button>
                    )}
                  </div>
                </>
              )}
              <form onSubmit={saveCustomer}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold" htmlFor="name">Nama pembeli</label>
                    <input id="name" type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition-colors focus:border-primary dark:border-slate-700 dark:bg-slate-950" required />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold" htmlFor="totalOrders">Total pemesanan</label>
                    <input id="totalOrders" type="number" min={0} step={1} value={totalOrders} onChange={(e) => setTotalOrders(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition-colors focus:border-primary dark:border-slate-700 dark:bg-slate-950" required />
                  </div>
                </div>
                {formError && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40">{formError}</div>}
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button type="button" onClick={closeCustomerDialog} className="rounded-xl border border-slate-200 px-5 py-3 font-bold transition-colors hover:border-primary hover:text-primary dark:border-slate-700">Batal</button>
                  <button type="submit" disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white transition-colors hover:bg-blue-800 disabled:opacity-60">
                    <Check className="h-4 w-4" />{isSaving ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Dialog: Queue Add/Edit ── */}
        {isQueueDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 px-3 py-3 sm:items-center sm:px-4 sm:py-6">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl dark:bg-slate-900 sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-primary sm:text-sm">{queueDialogMode === "add" ? "Tambah antrean baru" : "Edit antrean"}</span>
                  <h2 className="mt-2 font-[var(--font-display)] text-xl font-extrabold sm:text-2xl">{queueDialogMode === "add" ? "Input Cucian Baru" : "Edit Cucian dalam Antrean"}</h2>
                </div>
                <button type="button" onClick={() => setIsQueueDialogOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 transition-colors hover:border-primary hover:text-primary dark:border-slate-700" aria-label="Tutup dialog"><X className="h-4 w-4" /></button>
              </div>

              <form onSubmit={handleSaveQueueItem}>
                <div className="grid gap-4">

                  {/* Nomor Antrean — read only */}
                  <div>
                    <label className="mb-2 block text-sm font-bold">Nomor Antrean <span className="text-xs font-normal text-slate-400">(otomatis)</span></label>
                    <input type="text" value={queueNoAntrean} readOnly
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono font-bold text-slate-500 outline-none cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400" />
                  </div>

                  {/* Pelanggan Picker */}
                  <div>
                    <label className="mb-2 block text-sm font-bold">Pelanggan</label>
                    {selectedLaundryCustomer ? (
                      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950/30">
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{selectedLaundryCustomer.nama}</div>
                          <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-slate-500">
                            {selectedLaundryCustomer.nomor_kamar && <span className="flex items-center gap-1"><Home className="h-3 w-3" />{selectedLaundryCustomer.nomor_kamar}</span>}
                            {selectedLaundryCustomer.nomor_wa && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{selectedLaundryCustomer.nomor_wa}</span>}
                          </div>
                        </div>
                        <button type="button" onClick={() => setIsPickerOpen(true)}
                          className="flex-shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold transition-colors hover:border-primary hover:text-primary dark:border-slate-700">
                          Ganti
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setIsPickerOpen(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-4 py-4 text-sm font-bold text-slate-500 transition-colors hover:border-primary hover:text-primary dark:border-slate-700">
                        <Search className="h-4 w-4" />Klik untuk pilih pelanggan...
                      </button>
                    )}
                  </div>

                  {/* Layanan + Berat */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold" htmlFor="queueLayanan">Jenis Layanan</label>
                      <select id="queueLayanan" value={queueLayanan} onChange={(e) => setQueueLayanan(e.target.value as "Reguler" | "Express" | "Extra Express")}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold outline-none transition-colors focus:border-primary dark:border-slate-700 dark:bg-slate-950">
                        <option value="Reguler">Reguler (Batas 3 hari)</option>
                        <option value="Express">Express (Batas 2 hari)</option>
                        <option value="Extra Express">Extra Express (Batas 1 hari)</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold" htmlFor="queueBerat">Berat (Kg)</label>
                      <input id="queueBerat" type="number" step="0.01" min="0.01" value={queueBerat} onChange={(e) => setQueueBerat(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition-colors focus:border-primary dark:border-slate-700 dark:bg-slate-950"
                        placeholder="Contoh: 3.5" required />
                    </div>
                  </div>
                </div>

                {queueFormError && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40">{queueFormError}</div>}

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button type="button" onClick={() => setIsQueueDialogOpen(false)}
                    className="rounded-xl border border-slate-200 px-5 py-3 font-bold transition-colors hover:border-primary hover:text-primary dark:border-slate-700">Batal</button>
                  <button type="submit" disabled={isQueueSaving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white transition-colors hover:bg-blue-800 disabled:opacity-60">
                    <Check className="h-4 w-4" />{isQueueSaving ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Customer Picker Overlay ── */}
        {isPickerOpen && (
          <CustomerPickerDialog
            onSelect={handlePickerSelect}
            onClose={() => setIsPickerOpen(false)}
            accessToken={session?.access_token}
          />
        )}

      </div>
    </main>
  );
}

// ── Sub-Components ─────────────────────────────────────────────────────────────

function AdminMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:text-sm">{label}</div>
      <div className="mt-2 font-[var(--font-display)] text-3xl font-extrabold text-primary sm:text-4xl">{value}</div>
    </div>
  );
}

function AdminCustomerCard({ customer, onEdit, onMarkUsed, onUndoUsed, onDelete }: {
  customer: Customer; onEdit: () => void; onMarkUsed: () => void; onUndoUsed: () => void; onDelete: () => void;
}) {
  const reward = getRewardStats(customer.total_orders, customer.rewards_used);
  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-slate-900 dark:text-slate-100">{customer.name}</h3>
            <p className="mt-0.5 text-sm font-medium text-slate-500">{customer.total_orders} pemesanan selesai</p>
          </div>
          <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-bold text-slate-950 shadow-sm"><Gift className="h-4 w-4" />{reward.availableRewards}</span>
        </div>
        <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/50">
          <dl className="grid grid-cols-3 gap-2 text-center text-sm">
            <div><dt className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total</dt><dd className="mt-1 font-[var(--font-display)] text-xl font-bold">{reward.totalRewards}</dd></div>
            <div><dt className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dipakai</dt><dd className="mt-1 font-[var(--font-display)] text-xl font-bold">{customer.rewards_used}</dd></div>
            <div><dt className="text-xs font-bold text-primary uppercase tracking-wider">Tersedia</dt><dd className="mt-1 font-[var(--font-display)] text-xl font-bold text-primary">{reward.availableRewards}</dd></div>
          </dl>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-[1px] border-t border-slate-100 bg-slate-100 p-[1px] dark:border-slate-800 dark:bg-slate-800">
        <button type="button" onClick={onEdit} className="bg-white px-3 py-3.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80">Edit</button>
        <button type="button" onClick={onDelete} className="bg-white px-3 py-3.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 dark:bg-slate-900 dark:hover:bg-red-950/40">Hapus</button>
        <button type="button" onClick={onUndoUsed} disabled={customer.rewards_used < 1} className="inline-flex items-center justify-center gap-1.5 bg-white px-3 py-3.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80"><Minus className="h-4 w-4" />Undo</button>
        <button type="button" onClick={onMarkUsed} disabled={reward.availableRewards < 1} className="inline-flex items-center justify-center gap-1.5 bg-primary px-3 py-3.5 text-sm font-bold text-white transition-colors hover:bg-blue-800 disabled:opacity-50 dark:bg-primary dark:hover:bg-blue-800"><Check className="h-4 w-4" />Pakai</button>
      </div>
    </article>
  );
}

function AdminQueueCard({ item, onEdit, onUpdateStatus, onTogglePayment, onDelete }: {
  item: SortedQueueItem;
  onEdit: () => void;
  onUpdateStatus: (status: "pending" | "proses" | "selesai") => void;
  onTogglePayment: () => void;
  onDelete: () => void;
}) {
  const lc = item.laundry_customers;
  const sisaHari = item.sisaHariSorting;
  let sisaHariText = `${sisaHari} hari`, sisaHariColor = "text-emerald-600 dark:text-emerald-400";
  if (sisaHari < 0) { sisaHariText = `Terlambat ${Math.abs(sisaHari)} hari`; sisaHariColor = "text-rose-600 dark:text-rose-400 font-bold"; }
  else if (sisaHari === 0) { sisaHariText = "Hari ini"; sisaHariColor = "text-amber-600 dark:text-amber-400 font-bold"; }
  else if (sisaHari === 1) sisaHariText = "Besok";

  let prioColor = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  if (item.predictedPriority === "Prioritas Tinggi") prioColor = "bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-400";
  else if (item.predictedPriority === "Prioritas Sedang") prioColor = "bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-400";
  else if (item.predictedPriority === "Prioritas Rendah") prioColor = "bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-400";

  const fdt = (iso: string | null | undefined) => iso ? new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }) : null;

  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Ticket Header */}
      <div className="relative p-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white text-xs shadow-sm">{item.workOrder}</span>
              <h3 className="truncate text-lg font-bold text-slate-900 dark:text-slate-100">{item.nama_pelanggan}</h3>
            </div>
            <p className="mt-1.5 font-mono text-sm font-bold tracking-tight text-slate-500">{item.no_antrean} <span className="text-slate-300 mx-1">•</span> {item.jenis_layanan}</p>
            {(lc?.nomor_kamar || lc?.nomor_wa) && (
              <p className="mt-2 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                {lc?.nomor_kamar && <span className="flex items-center gap-1"><Home className="h-3.5 w-3.5" />{lc.nomor_kamar}</span>}
                {lc?.nomor_wa && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{lc.nomor_wa}</span>}
              </p>
            )}
          </div>
          <span className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-sm ${prioColor}`}>{item.predictedPriority}</span>
        </div>
      </div>
      
      {/* Dashed Divider */}
      <div className="relative flex items-center px-2">
        <div className="h-4 w-4 -ml-4 rounded-full bg-slate-50 border-r border-slate-200 dark:bg-slate-950 dark:border-slate-800"></div>
        <div className="h-[2px] flex-1 border-b-2 border-dashed border-slate-200 dark:border-slate-700"></div>
        <div className="h-4 w-4 -mr-4 rounded-full bg-slate-50 border-l border-slate-200 dark:bg-slate-950 dark:border-slate-800"></div>
      </div>

      {/* Ticket Body */}
      <div className="p-5 pt-4">
        <dl className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
          <div><dt className="text-xs font-bold text-slate-500 uppercase tracking-wider">Berat</dt><dd className="mt-1 font-[var(--font-display)] text-xl font-bold">{item.berat} Kg</dd></div>
          <div><dt className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sisa Waktu</dt><dd className={`mt-1 font-[var(--font-display)] text-xl font-bold ${sisaHariColor}`}>{sisaHari < 0 && <ShieldAlert className="h-4 w-4 inline mr-1" />}{sisaHariText}</dd></div>
          <div><dt className="text-xs font-bold text-slate-500 uppercase tracking-wider">Masuk</dt><dd className="mt-1 font-medium">{fdt(item.tanggal_masuk) ?? "—"}</dd></div>
          {item.waktu_proses && <div><dt className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mulai Proses</dt><dd className="mt-1 font-medium">{fdt(item.waktu_proses)}</dd></div>}
        </dl>
      </div>

      {/* Ticket Actions */}
      <div className="grid gap-[1px] border-t border-slate-100 bg-slate-100 p-[1px] dark:border-slate-800 dark:bg-slate-800">
        <div className="flex gap-[1px]">
          <button type="button" onClick={onTogglePayment}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-4 text-sm font-bold transition-colors ${item.sudah_bayar ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400"}`}>
            <Wallet className="h-4 w-4" />{item.sudah_bayar ? "Lunas" : "Belum Bayar"}
          </button>
          <div className="flex-1 bg-white dark:bg-slate-900 relative">
            <select value={item.status} onChange={(e) => onUpdateStatus(e.target.value as "pending" | "proses" | "selesai")}
              className="absolute inset-0 w-full h-full appearance-none bg-transparent px-4 py-4 text-center text-sm font-bold outline-none cursor-pointer">
              <option value="pending">⏳ Pending</option>
              <option value="proses">👕 Proses</option>
              <option value="selesai">✅ Selesai</option>
            </select>
          </div>
        </div>
        <div className="flex gap-[1px]">
          <button type="button" onClick={onEdit} className="flex-1 bg-white px-3 py-3.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80">Edit</button>
          <button type="button" onClick={onDelete} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white px-3 py-3.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 dark:bg-slate-900 dark:hover:bg-red-950/40"><Trash2 className="h-4 w-4" />Hapus</button>
        </div>
      </div>
    </article>
  );
}
