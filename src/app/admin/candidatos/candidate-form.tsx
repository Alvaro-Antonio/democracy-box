"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Upload, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { createCandidate, deleteCandidate, updateCandidate } from "@/app/actions/candidates";
import { CandidateAvatar } from "@/components/candidate-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Candidate } from "@/types/domain";

interface CandidateManagerProps {
  candidates: Candidate[];
  chapasExist: boolean;
  maxReached: boolean;
}

export function CandidateManager({
  candidates,
  chapasExist,
  maxReached,
}: CandidateManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createCandidate(formData);
      if (result.ok) {
        toast.success("Candidato cadastrado com sucesso!");
        setIsAddOpen(false);
        router.refresh();
      } else {
        toast.error(result.error.message);
      }
    });
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCandidate) return;
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateCandidate(editingCandidate.id, formData);
      if (result.ok) {
        toast.success("Candidato atualizado com sucesso!");
        setEditingCandidate(null);
        router.refresh();
      } else {
        toast.error(result.error.message);
      }
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o candidato "${name}"?`)) return;

    startTransition(async () => {
      const result = await deleteCandidate(id);
      if (result.ok) {
        toast.success("Candidato excluído.");
        router.refresh();
      } else {
        toast.error(result.error.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Lista de Candidatos ({candidates.length}/5)</h2>
          {chapasExist && (
            <p className="text-xs text-amber-400 mt-0.5">
              Chapas já foram geradas: a adição e exclusão de candidatos estão bloqueadas para manter a integridade.
            </p>
          )}
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button disabled={maxReached || chapasExist}>
              <Plus className="size-4 mr-1.5" />
              Novo Candidato
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Adicionar Candidato</DialogTitle>
                <DialogDescription>
                  Cadastre um candidato para concorrer na eleição (máximo 5).
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" name="name" required placeholder="Ex: Maria da Silva" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Biografia / Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Breve histórico ou propostas do candidato..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo">Foto (JPEG, PNG ou WebP até 2MB)</Label>
                  <Input id="photo" name="photo" type="file" accept="image/png,image/jpeg,image/webp" />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {candidates.map((candidate) => (
          <div
            key={candidate.id}
            className="flex flex-col justify-between p-4 rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm"
          >
            <div className="flex items-start gap-3">
              <CandidateAvatar candidate={candidate} size="lg" />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-base truncate">{candidate.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                  {candidate.description || "Sem descrição fornecida."}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border/40 pt-3 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingCandidate(candidate)}
              >
                <Pencil className="size-3.5 mr-1" />
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                disabled={chapasExist || isPending}
                onClick={() => handleDelete(candidate.id, candidate.name)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {editingCandidate && (
        <Dialog open={!!editingCandidate} onOpenChange={(open) => !open && setEditingCandidate(null)}>
          <DialogContent>
            <form onSubmit={handleUpdate}>
              <DialogHeader>
                <DialogTitle>Editar Candidato</DialogTitle>
                <DialogDescription>Altere as informações de {editingCandidate.name}.</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome Completo</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={editingCandidate.name}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Biografia / Descrição</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    defaultValue={editingCandidate.description || ""}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-photo">Substituir Foto (opcional)</Label>
                  <Input
                    id="edit-photo"
                    name="photo"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingCandidate(null)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
                  Atualizar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
