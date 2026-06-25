"use server";

import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { LaundryQueueItem, LaundryCustomer, Database } from "@/lib/supabase/types";
import { predictPriority, PriorityPrediction } from "@/lib/prediction";

function getSupabaseServerClient(accessToken?: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!accessToken) return supabase;

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type SortedQueueItem = LaundryQueueItem & {
  predictedPriority: PriorityPrediction;
  sisaHariSorting: number;
  workOrder: number;
  laundry_customers: LaundryCustomer | null;
};

// ── Helpers ────────────────────────────────────────────────────────────────

function normalizeQueueItem(item: Record<string, unknown>): LaundryQueueItem {
  return {
    ...(item as LaundryQueueItem),
    berat: Number(item.berat),
    waktu_proses: (item.waktu_proses as string | null) ?? null,
    waktu_selesai: (item.waktu_selesai as string | null) ?? null,
    estimasi_selesai: (item.estimasi_selesai as string | null) ?? null,
    sudah_bayar: (item.sudah_bayar as boolean) ?? false,
    customer_id: (item.customer_id as string | null) ?? null,
    laundry_customers: (item.laundry_customers as LaundryCustomer | null) ?? null,
  };
}

// ── Backlog / Capacity Logic ───────────────────────────────────────────────

/**
 * Gets the sum of weight (berat) for all items that are currently pending or proses.
 */
export async function getTotalActiveWeight(accessToken?: string): Promise<number> {
  try {
    const client = getSupabaseServerClient(accessToken);
    const { data, error } = await client
      .from("laundry_queue")
      .select("berat")
      .in("status", ["pending", "proses"]);

    if (error) {
      console.error("Error fetching total weight:", error);
      return 0;
    }
    
    if (!data) return 0;
    return data.reduce((acc, item) => acc + (item.berat || 0), 0);
  } catch (err) {
    console.error("Failed to get active weight:", err);
    return 0;
  }
}

// ── Queue Number Generation ────────────────────────────────────────────────

/**
 * Generates the next queue number in format YYYYMM + 3-digit seq (WIB timezone).
 */
export async function generateQueueNumber(accessToken?: string): Promise<string> {
  try {
    const client = getSupabaseServerClient(accessToken);
    const now = new Date();
    const wibTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const yearMonth = wibTime.toISOString().slice(0, 7).replace("-", ""); // "202606"

    const { count, error } = await client
      .from("laundry_queue")
      .select("*", { count: "exact", head: true })
      .like("no_antrean", `${yearMonth}%`);

    if (error) return `${yearMonth}001`;
    const seq = (count ?? 0) + 1;
    return `${yearMonth}${String(seq).padStart(3, "0")}`;
  } catch {
    const now = new Date();
    const wibTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const yearMonth = wibTime.toISOString().slice(0, 7).replace("-", "");
    return `${yearMonth}001`;
  }
}

// ── Queue CRUD ─────────────────────────────────────────────────────────────

/**
 * Fetches active queue items (pending + proses), runs ONNX predictions, sorts them.
 * JOINs laundry_customers to include customer info.
 */
export async function getSortedQueue(
  sdmCount: number,
  accessToken?: string
): Promise<SortedQueueItem[]> {
  try {
    const client = getSupabaseServerClient(accessToken);
    const { data: rawItems, error } = await client
      .from("laundry_queue")
      .select("*, laundry_customers(*)")
      .in("status", ["pending", "proses"])
      .order("tanggal_masuk", { ascending: true });

    if (error) {
      console.error("Error fetching laundry queue:", error);
      throw new Error("Gagal mengambil data antrean dari database.");
    }
    if (!rawItems || rawItems.length === 0) return [];

    const predictedItems = await Promise.all(
      rawItems.map(async (item, index) => {
        const normalized = normalizeQueueItem(item as Record<string, unknown>);
        const { priority, sisaHariSorting } = await predictPriority(
          normalized.jenis_layanan,
          normalized.berat,
          index,
          sdmCount,
          normalized.tanggal_masuk,
          normalized.estimasi_selesai // pass this to use real date logic
        );
        return { ...normalized, predictedPriority: priority, sisaHariSorting };
      })
    );

    const priorityWeight: Record<PriorityPrediction, number> = {
      "Prioritas Tinggi": 0,
      "Prioritas Sedang": 1,
      "Prioritas Rendah": 2,
    };

    predictedItems.sort((a, b) => {
      const prioA = priorityWeight[a.predictedPriority];
      const prioB = priorityWeight[b.predictedPriority];
      if (prioA !== prioB) return prioA - prioB;
      if (a.sisaHariSorting !== b.sisaHariSorting) return a.sisaHariSorting - b.sisaHariSorting;
      return a.no_antrean.localeCompare(b.no_antrean);
    });

    return predictedItems.map((item, index) => ({
      ...item,
      workOrder: index + 1,
    })) as SortedQueueItem[];
  } catch (err) {
    console.error("Error in getSortedQueue action:", err);
    return [];
  }
}

/**
 * Inserts a new item into the laundry queue.
 * Queue number is auto-generated server-side.
 */
export async function addQueueItem(
  data: {
    customer_id?: string | null;
    nama_pelanggan: string;
    jenis_layanan: "Reguler" | "Express" | "Extra Express";
    berat: number;
    estimasi_selesai?: string | null;
  },
  accessToken?: string
): Promise<{ success: boolean; error?: string; no_antrean?: string }> {
  try {
    const client = getSupabaseServerClient(accessToken);
    const no_antrean = await generateQueueNumber(accessToken);

    const { error } = await client.from("laundry_queue").insert({
      no_antrean,
      customer_id: data.customer_id ?? null,
      nama_pelanggan: data.nama_pelanggan,
      jenis_layanan: data.jenis_layanan,
      berat: data.berat,
      status: "pending",
      sudah_bayar: false,
      estimasi_selesai: data.estimasi_selesai ?? null,
    });

    if (error) {
      console.error("Error inserting queue item:", error);
      return { success: false, error: error.message };
    }
    return { success: true, no_antrean };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Updates a queue item's metadata.
 */
export async function updateQueueItem(
  id: string,
  data: {
    customer_id?: string | null;
    nama_pelanggan: string;
    jenis_layanan: "Reguler" | "Express" | "Extra Express";
    berat: number;
    estimasi_selesai?: string | null;
  },
  accessToken?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getSupabaseServerClient(accessToken);
    const { error } = await client
      .from("laundry_queue")
      .update({
        customer_id: data.customer_id ?? null,
        nama_pelanggan: data.nama_pelanggan,
        jenis_layanan: data.jenis_layanan,
        berat: data.berat,
        ...(data.estimasi_selesai !== undefined && { estimasi_selesai: data.estimasi_selesai }),
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating queue item:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Updates the status of a queue item.
 * Automatically timestamps proses/selesai transitions.
 */
export async function updateQueueItemStatus(
  id: string,
  status: "pending" | "proses" | "selesai",
  accessToken?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getSupabaseServerClient(accessToken);
    const now = new Date().toISOString();

    const updatePayload: {
      status: "pending" | "proses" | "selesai";
      waktu_proses?: string;
      waktu_selesai?: string;
    } = { status };
    if (status === "proses") updatePayload.waktu_proses = now;
    else if (status === "selesai") updatePayload.waktu_selesai = now;

    const { error } = await client
      .from("laundry_queue")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      console.error("Error updating queue status:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Removes an item from the laundry queue.
 */
export async function deleteQueueItem(
  id: string,
  accessToken?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getSupabaseServerClient(accessToken);
    const { error } = await client.from("laundry_queue").delete().eq("id", id);

    if (error) {
      console.error("Error deleting queue item:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Toggles the payment status of a queue item.
 */
export async function togglePaymentStatus(
  id: string,
  sudah_bayar: boolean,
  accessToken?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getSupabaseServerClient(accessToken);
    const { error } = await client
      .from("laundry_queue")
      .update({ sudah_bayar })
      .eq("id", id);

    if (error) {
      console.error("Error toggling payment status:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Fetches completed laundry history (status = 'selesai'), paginated 50/page.
 * JOINs laundry_customers to include customer info.
 */
export async function getHistoryQueue(
  page: number = 0,
  accessToken?: string
): Promise<{ items: LaundryQueueItem[]; hasMore: boolean }> {
  const PAGE_SIZE = 50;
  try {
    const client = getSupabaseServerClient(accessToken);
    const { data, error, count } = await client
      .from("laundry_queue")
      .select("*, laundry_customers(*)", { count: "exact" })
      .eq("status", "selesai")
      .order("waktu_selesai", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
      console.error("Error fetching queue history:", error);
      return { items: [], hasMore: false };
    }

    const items = (data ?? []).map((item) =>
      normalizeQueueItem(item as Record<string, unknown>)
    );
    const hasMore = count !== null && (page + 1) * PAGE_SIZE < count;
    return { items, hasMore };
  } catch (err) {
    console.error("Error in getHistoryQueue:", err);
    return { items: [], hasMore: false };
  }
}
