"use server";

import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { LaundryCustomer, Database } from "@/lib/supabase/types";

function getSupabaseServerClient(accessToken?: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!accessToken) return supabase;

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Fetches all laundry customers, optionally filtered by a search query.
 * Searches across: nama, nomor_kamar, nomor_wa (case-insensitive).
 */
export async function getLaundryCustomers(
  query?: string,
  accessToken?: string
): Promise<LaundryCustomer[]> {
  try {
    const client = getSupabaseServerClient(accessToken);
    let req = client
      .from("laundry_customers")
      .select("*")
      .order("nama", { ascending: true });

    if (query && query.trim()) {
      const q = query.trim();
      req = req.or(
        `nama.ilike.%${q}%,nomor_kamar.ilike.%${q}%,nomor_wa.ilike.%${q}%`
      );
    }

    const { data, error } = await req;
    if (error) {
      console.error("Error fetching laundry customers:", error);
      return [];
    }
    return (data ?? []) as LaundryCustomer[];
  } catch (err) {
    console.error("getLaundryCustomers error:", err);
    return [];
  }
}

/**
 * Adds a new laundry customer to the master table.
 */
export async function addLaundryCustomer(
  data: { nama: string; nomor_wa?: string; nomor_kamar?: string },
  accessToken?: string
): Promise<{ success: boolean; customer?: LaundryCustomer; error?: string }> {
  try {
    const client = getSupabaseServerClient(accessToken);
    const { data: inserted, error } = await client
      .from("laundry_customers")
      .insert({
        nama: data.nama.trim(),
        nomor_wa: data.nomor_wa?.trim() || null,
        nomor_kamar: data.nomor_kamar?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding laundry customer:", error);
      return { success: false, error: error.message };
    }
    return { success: true, customer: inserted as LaundryCustomer };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Updates an existing laundry customer's info.
 */
export async function updateLaundryCustomer(
  id: string,
  data: { nama: string; nomor_wa?: string; nomor_kamar?: string },
  accessToken?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getSupabaseServerClient(accessToken);
    const { error } = await client
      .from("laundry_customers")
      .update({
        nama: data.nama.trim(),
        nomor_wa: data.nomor_wa?.trim() || null,
        nomor_kamar: data.nomor_kamar?.trim() || null,
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating laundry customer:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Deletes a laundry customer from the master table.
 * Queue items referencing this customer will have customer_id set to NULL (ON DELETE SET NULL).
 */
export async function deleteLaundryCustomer(
  id: string,
  accessToken?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getSupabaseServerClient(accessToken);
    const { error } = await client
      .from("laundry_customers")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting laundry customer:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
