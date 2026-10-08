"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { safeNextPath } from "@/lib/auth/safe-next";
import { toActionResult } from "@/lib/errors";
import { createServerSupabase } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/domain";

const passwordSchema = z.object({
  email: z.string().email("E-mail inválido."),
  password: z.string().min(6, "A senha deve conter no mínimo 6 caracteres."),
  next: z.string().optional(),
});

const magicLinkSchema = z.object({
  email: z.string().email("E-mail inválido."),
  next: z.string().optional(),
});

export async function signInWithPassword(formData: FormData): Promise<ActionResult<{ redirectTo: string }>> {
  return toActionResult(async () => {
    const raw = {
      email: formData.get("email"),
      password: formData.get("password"),
      next: formData.get("next"),
    };
    const parsed = passwordSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message || "Dados inválidos.");
    }

    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      throw new Error("E-mail ou senha incorretos.");
    }

    const redirectTo = safeNextPath(parsed.data.next);
    revalidatePath("/", "layout");
    return { redirectTo };
  });
}

export async function signUp(formData: FormData): Promise<ActionResult<{ message: string; redirectTo?: string }>> {
  return toActionResult(async () => {
    const raw = {
      email: formData.get("email"),
      password: formData.get("password"),
      next: formData.get("next"),
    };
    const parsed = passwordSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message || "Dados inválidos.");
    }

    const supabase = await createServerSupabase();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      throw new Error(error.message || "Não foi possível realizar o cadastro.");
    }

    revalidatePath("/", "layout");

    // Se já criou sessão imediata (confirmação desativada):
    if (data.session) {
      return {
        message: "Conta criada com sucesso!",
        redirectTo: safeNextPath(parsed.data.next),
      };
    }

    return {
      message: "Conta criada! Verifique seu e-mail para confirmar a inscrição antes de entrar.",
    };
  });
}

export async function sendMagicLink(formData: FormData): Promise<ActionResult<{ message: string }>> {
  return toActionResult(async () => {
    const raw = {
      email: formData.get("email"),
      next: formData.get("next"),
    };
    const parsed = magicLinkSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message || "Dados inválidos.");
    }

    const supabase = await createServerSupabase();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const next = safeNextPath(parsed.data.next);
    const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data.email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      throw new Error(error.message || "Erro ao enviar Magic Link.");
    }

    return {
      message: "Magic Link enviado! Verifique sua caixa de entrada.",
    };
  });
}

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
