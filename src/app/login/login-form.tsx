"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, UserPlus, KeyRound, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { sendMagicLink, signInWithPassword, signUp } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LoginFormProps {
  next: string;
}

export function LoginForm({ next }: LoginFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"password" | "magic" | "signup">("password");

  const handlePasswordLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("next", next);

    startTransition(async () => {
      const result = await signInWithPassword(formData);
      if (result.ok) {
        toast.success("Login efetuado com sucesso!");
        router.push(result.data.redirectTo);
        router.refresh();
      } else {
        toast.error(result.error.message);
      }
    });
  };

  const handleMagicLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("next", next);

    startTransition(async () => {
      const result = await sendMagicLink(formData);
      if (result.ok) {
        toast.success(result.data.message);
      } else {
        toast.error(result.error.message);
      }
    });
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("next", next);

    startTransition(async () => {
      const result = await signUp(formData);
      if (result.ok) {
        toast.success(result.data.message);
        if (result.data.redirectTo) {
          router.push(result.data.redirectTo);
          router.refresh();
        } else {
          setActiveTab("password");
        }
      } else {
        toast.error(result.error.message);
      }
    });
  };

  return (
    <Card className="border-border/60 bg-card/70 backdrop-blur-md shadow-xl">
      <CardHeader className="text-center pb-6">
        <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-2">
          <KeyRound className="size-6" />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">Identificação de Eleitor</CardTitle>
        <CardDescription>
          Acesse para registrar seu voto único ou gerenciar a eleição.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="password">Senha</TabsTrigger>
            <TabsTrigger value="magic">Magic Link</TabsTrigger>
            <TabsTrigger value="signup">Cadastrar</TabsTrigger>
          </TabsList>

          <TabsContent value="password">
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    required
                    className="pl-9"
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="pl-9"
                    disabled={isPending}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full font-semibold" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar com Senha
                    <ArrowRight className="size-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="magic">
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="magic-email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="magic-email"
                    name="email"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    required
                    className="pl-9"
                    disabled={isPending}
                  />
                </div>
              </div>

              <Button type="submit" variant="secondary" className="w-full font-semibold" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Enviando link...
                  </>
                ) : (
                  <>
                    Receber Link por E-mail
                    <Mail className="size-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    required
                    className="pl-9"
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Criar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                    className="pl-9"
                    disabled={isPending}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full font-semibold" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    Criar Conta
                    <UserPlus className="size-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
