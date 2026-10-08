"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/admin";
import { toActionResult } from "@/lib/errors";
import { validateImage } from "@/lib/images/validate-image";
import { createAdminSupabase } from "@/lib/supabase/admin";
import type { ActionResult, Candidate } from "@/types/domain";

const candidateSchema = z.object({
  name: z.string().trim().min(2, "O nome deve ter no mínimo 2 caracteres.").max(80, "Nome muito longo."),
  description: z.string().trim().max(500, "Descrição deve ter no máximo 500 caracteres.").optional().nullable(),
});

export async function createCandidate(formData: FormData): Promise<ActionResult<Candidate>> {
  return toActionResult(async () => {
    await requireAdmin();
    const adminSupabase = createAdminSupabase();

    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString() || null;
    const photoFile = formData.get("photo") as File | null;

    const parsed = candidateSchema.safeParse({ name, description });
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message || "Dados inválidos.");
    }

    let photoUrl: string | null = null;
    if (photoFile && photoFile.size > 0) {
      const bytes = new Uint8Array(await photoFile.arrayBuffer());
      const validation = validateImage({
        type: photoFile.type,
        size: photoFile.size,
        bytes,
      });

      if (!validation.ok) {
        throw new Error(validation.message);
      }

      const fileName = `${crypto.randomUUID()}.${validation.ext}`;
      const { error: uploadError } = await adminSupabase.storage
        .from("candidate-photos")
        .upload(fileName, bytes, {
          contentType: photoFile.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error("Erro no upload da foto do candidato.");
      }

      const { data: publicUrlData } = adminSupabase.storage
        .from("candidate-photos")
        .getPublicUrl(fileName);

      photoUrl = publicUrlData.publicUrl;
    }

    const { data, error } = await adminSupabase
      .from("candidates")
      .insert({
        name: parsed.data.name,
        description: parsed.data.description,
        photo_url: photoUrl,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/candidatos");
    revalidatePath("/admin");
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      photoUrl: data.photo_url,
      createdAt: data.created_at,
    };
  });
}

export async function updateCandidate(id: string, formData: FormData): Promise<ActionResult<Candidate>> {
  return toActionResult(async () => {
    await requireAdmin();
    const adminSupabase = createAdminSupabase();

    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString() || null;
    const photoFile = formData.get("photo") as File | null;

    const parsed = candidateSchema.safeParse({ name, description });
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message || "Dados inválidos.");
    }

    const { data: existing } = await adminSupabase
      .from("candidates")
      .select("*")
      .eq("id", id)
      .single();

    if (!existing) throw new Error("Candidato não encontrado.");

    let photoUrl = existing.photo_url;
    if (photoFile && photoFile.size > 0) {
      const bytes = new Uint8Array(await photoFile.arrayBuffer());
      const validation = validateImage({
        type: photoFile.type,
        size: photoFile.size,
        bytes,
      });

      if (!validation.ok) {
        throw new Error(validation.message);
      }

      const fileName = `${crypto.randomUUID()}.${validation.ext}`;
      const { error: uploadError } = await adminSupabase.storage
        .from("candidate-photos")
        .upload(fileName, bytes, {
          contentType: photoFile.type,
          upsert: false,
        });

      if (!uploadError) {
        const { data: publicUrlData } = adminSupabase.storage
          .from("candidate-photos")
          .getPublicUrl(fileName);
        photoUrl = publicUrlData.publicUrl;
      }
    }

    const { data, error } = await adminSupabase
      .from("candidates")
      .update({
        name: parsed.data.name,
        description: parsed.data.description,
        photo_url: photoUrl,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    revalidatePath("/admin/candidatos");
    revalidatePath("/admin");
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      photoUrl: data.photo_url,
      createdAt: data.created_at,
    };
  });
}

export async function deleteCandidate(id: string): Promise<ActionResult<{ success: true }>> {
  return toActionResult(async () => {
    await requireAdmin();
    const adminSupabase = createAdminSupabase();

    const { error } = await adminSupabase.from("candidates").delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/candidatos");
    revalidatePath("/admin");
    return { success: true };
  });
}
