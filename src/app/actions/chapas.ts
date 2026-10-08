"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";
import { toActionResult } from "@/lib/errors";
import { generateChapaRankings } from "@/lib/ranked/permutations";
import { createAdminSupabase } from "@/lib/supabase/admin";
import type { ActionResult } from "@/types/domain";

export async function generateChapas(): Promise<ActionResult<{ count: number }>> {
  return toActionResult(async () => {
    await requireAdmin();
    const adminSupabase = createAdminSupabase();

    // 1. Confere estado da eleição (deve ser draft)
    const { data: settings } = await adminSupabase
      .from("election_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (settings?.is_open || settings?.closed_at) {
      throw new Error("Não é possível alterar chapas enquanto a eleição estiver aberta ou encerrada.");
    }

    // 2. Confere se já existem votos
    const { count: voteCount } = await adminSupabase
      .from("votes")
      .select("*", { count: "exact", head: true });

    if ((voteCount || 0) > 0) {
      throw new Error("Já existem votos registrados. As chapas não podem ser regeradas.");
    }

    // 3. Obtém candidatos ordenados por data de criação
    const { data: candidates, error: candError } = await adminSupabase
      .from("candidates")
      .select("id")
      .order("created_at", { ascending: true });

    if (candError || !candidates || candidates.length === 0) {
      throw new Error("Cadastre ao menos um candidato antes de gerar as chapas.");
    }

    const candidateIds = candidates.map((c) => c.id);
    const rankings = generateChapaRankings(candidateIds);

    // 4. Limpa chapas anteriores
    await adminSupabase.from("chapas").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 5. Insere novas chapas em lotes
    const records = rankings.map((ranking, index) => ({
      number: index + 1,
      candidate_ids: ranking,
    }));

    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const { error: insertError } = await adminSupabase.from("chapas").insert(batch);
      if (insertError) {
        throw new Error(`Erro ao salvar chapas: ${insertError.message}`);
      }
    }

    revalidatePath("/admin/chapas");
    revalidatePath("/admin");
    revalidatePath("/votar");
    return { count: records.length };
  });
}
