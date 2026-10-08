import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/admin";
import { safeNextPath } from "@/lib/auth/safe-next";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Entrar ou Cadastrar — Democracy Box",
  description: "Acesse sua conta de eleitor ou administrador para participar.",
};

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const next = safeNextPath(params.next);

  // Se já estiver logado, redireciona diretamente
  if (user) {
    redirect(next);
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <LoginForm next={next} />
      </div>
    </div>
  );
}
