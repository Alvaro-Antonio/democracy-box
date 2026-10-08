"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth/admin";
import { mapRpcError, toActionResult } from "@/lib/errors";
import { createServerSupabase } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/domain";

const voteSchema = z.object({
  chapaId: z.string().uuid("Identificador de chapa inválido."),
});

export async function castVote(
  chapaId: string,
): Promise<ActionResult<{ code: string; chapaNumber: number }>> {
  return toActionResult(async () => {
    await requireUser();

    const parsed = voteSchema.safeParse({ chapaId });
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message || "Chapa inválida.");
    }

    const supabase = await createServerSupabase();

    // 1. Obtém número da chapa
    const { data: chapa, error: chapaErr } = await supabase
      .from("chapas")
      .select("number")
      .eq("id", parsed.data.chapaId)
      .single();

    if (chapaErr || !chapa) {
      throw new Error("Chapa não encontrada.");
    }

    // 2. Chama RPC atômica que valida eleição, grava recibo do eleitor e insere cédula anônima
    const { data: code, error: rpcError } = await supabase.rpc("cast_vote", {
      p_chapa_id: parsed.data.chapaId,
    });

    if (rpcError) {
      throw mapRpcError(rpcError);
    }

    revalidatePath("/votar");
    return {
      code,
      chapaNumber: chapa.number,
    };
  });
}
