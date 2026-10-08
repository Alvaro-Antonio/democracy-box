"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";
import { toActionResult } from "@/lib/errors";
import { createAdminSupabase } from "@/lib/supabase/admin";
import type { ActionResult, ElectionSettings } from "@/types/domain";

export async function openElection(): Promise<ActionResult<ElectionSettings>> {
  return toActionResult(async () => {
    await requireAdmin();
    const adminSupabase = createAdminSupabase();

    // 1. Confere se há chapas cadastradas
    const { count: chapasCount } = await adminSupabase
      .from("chapas")
      .select("*", { count: "exact", head: true });

    if (!chapasCount || chapasCount === 0) {
      throw new Error("Gere as chapas de votação antes de abrir a eleição.");
    }

    // 2. Confere se já foi encerrada
    const { data: current } = await adminSupabase
      .from("election_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (current?.closed_at) {
      throw new Error("Uma eleição encerrada não pode ser reaberta.");
    }

    const { data, error } = await adminSupabase
      .from("election_settings")
      .update({
        is_open: true,
        opened_at: new Date().toISOString(),
      })
      .eq("id", 1)
      .select()
      .single();

    if (error || !data) throw new Error("Erro ao abrir a votação.");

    revalidatePath("/", "layout");
    return {
      isOpen: data.is_open,
      openedAt: data.opened_at,
      closedAt: data.closed_at,
      status: "open",
    };
  });
}

export async function closeElection(): Promise<ActionResult<ElectionSettings>> {
  return toActionResult(async () => {
    await requireAdmin();
    const adminSupabase = createAdminSupabase();

    const { data: current } = await adminSupabase
      .from("election_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (!current?.is_open) {
      throw new Error("A eleição precisa estar aberta para poder ser encerrada.");
    }

    if (current.closed_at) {
      throw new Error("A eleição já foi encerrada.");
    }

    const { data, error } = await adminSupabase
      .from("election_settings")
      .update({
        is_open: false,
        closed_at: new Date().toISOString(),
      })
      .eq("id", 1)
      .select()
      .single();

    if (error || !data) throw new Error("Erro ao encerrar a eleição.");

    revalidatePath("/", "layout");
    return {
      isOpen: data.is_open,
      openedAt: data.opened_at,
      closedAt: data.closed_at,
      status: "closed",
    };
  });
}
