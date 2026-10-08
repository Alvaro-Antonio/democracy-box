"use server";

import { AppError, toActionResult } from "@/lib/errors";
import { normalizeVoteCode } from "@/lib/ranked/vote-code";
import { createServerSupabase } from "@/lib/supabase/server";
import type { ActionResult, Candidate } from "@/types/domain";

export type ValidationResult =
  | { valid: false }
  | {
      valid: true;
      chapaNumber: number;
      candidates: Candidate[];
    };

export async function validateVoteCode(
  rawInput: string,
): Promise<ActionResult<ValidationResult>> {
  return toActionResult(async () => {
    const normalized = normalizeVoteCode(rawInput);
    if (!normalized) {
      throw new AppError("VALIDATION", "Formato de código inválido. Utilize o formato VR-XXXX-XXXX-XXXX.");
    }

    const supabase = await createServerSupabase();

    // Chama a RPC pública validate_vote(p_code)
    const { data, error } = await supabase.rpc("validate_vote", {
      p_code: normalized,
    });

    if (error) {
      throw new Error("Erro ao validar o código.");
    }

    if (!data || data.length === 0) {
      return { valid: false };
    }

    const item = data[0];
    const candidateIds = Array.isArray(item.candidate_ids) ? (item.candidate_ids as string[]) : [];

    // Busca detalhes dos candidatos ranqueados
    const { data: candidatesData } = await supabase
      .from("candidates")
      .select("*")
      .in("id", candidateIds);

    const candidatesById = new Map<string, Candidate>();
    (candidatesData || []).forEach((c) =>
      candidatesById.set(c.id, {
        id: c.id,
        name: c.name,
        description: c.description,
        photoUrl: c.photo_url,
        createdAt: c.created_at,
      }),
    );

    // Garante que a ordem original da chapa (1º..5º) é preservada
    const orderedCandidates = candidateIds
      .map((id) => candidatesById.get(id))
      .filter((c): c is Candidate => Boolean(c));

    return {
      valid: true,
      chapaNumber: item.chapa_number,
      candidates: orderedCandidates,
    };
  });
}
