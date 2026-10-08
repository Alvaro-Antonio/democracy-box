import { createServerSupabase } from "@/lib/supabase/server";
import type { Candidate, Chapa, ElectionSettings } from "@/types/domain";

export async function getCandidates(): Promise<Candidate[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    photoUrl: row.photo_url,
    createdAt: row.created_at,
  }));
}

export async function getChapas(): Promise<Chapa[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("chapas")
    .select("*")
    .order("number", { ascending: true });

  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    number: row.number,
    candidateIds: Array.isArray(row.candidate_ids) ? (row.candidate_ids as string[]) : [],
  }));
}

export async function getElectionSettings(): Promise<ElectionSettings> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("election_settings").select("*").eq("id", 1).single();

  if (!data) {
    return {
      isOpen: false,
      openedAt: null,
      closedAt: null,
      status: "draft",
    };
  }

  let status: ElectionSettings["status"] = "draft";
  if (data.closed_at) {
    status = "closed";
  } else if (data.is_open) {
    status = "open";
  }

  return {
    isOpen: data.is_open,
    openedAt: data.opened_at,
    closedAt: data.closed_at,
    status,
  };
}

export async function hasVoted(): Promise<boolean> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.rpc("has_voted");
  return Boolean(data);
}
