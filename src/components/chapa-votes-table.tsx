import { formatChapaNumber } from "@/lib/ranked/vote-code";
import type { Candidate, CandidateId, Chapa } from "@/types/domain";

interface ChapaVotesTableProps {
  chapaVotes: { chapa: Chapa; votes: number }[];
  candidates: Candidate[];
}

export function ChapaVotesTable({ chapaVotes, candidates }: ChapaVotesTableProps) {
  const candidatesById = new Map<CandidateId, Candidate>();
  candidates.forEach((c) => candidatesById.set(c.id, c));

  const sorted = [...chapaVotes].sort((a, b) => b.votes - a.votes);
  const totalVotes = chapaVotes.reduce((sum, item) => sum + item.votes, 0);

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md overflow-hidden shadow-lg">
      <div className="p-4 sm:p-5 border-b border-border/50 bg-muted/20 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-base">Distribuição de Votos por Chapa</h3>
          <p className="text-xs text-muted-foreground">
            Votos diretos que cada permutação ordenada de candidatos recebeu dos eleitores.
          </p>
        </div>
        <span className="text-xs font-mono bg-muted/60 px-2.5 py-1 rounded-md border border-border/40">
          {totalVotes} votos totais
        </span>
      </div>

      <div className="overflow-x-auto max-h-[480px]">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-muted/40 text-muted-foreground border-b border-border/40 sticky top-0 backdrop-blur-md">
            <tr>
              <th className="py-2.5 px-4 font-semibold">Chapa</th>
              <th className="py-2.5 px-4 font-semibold">Ordem das Preferências</th>
              <th className="py-2.5 px-4 font-semibold text-right">Votos</th>
              <th className="py-2.5 px-4 font-semibold text-right">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {sorted.map((item) => {
              const pct = totalVotes > 0 ? (item.votes / totalVotes) * 100 : 0;
              return (
                <tr key={item.chapa.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-primary whitespace-nowrap">
                    #{formatChapaNumber(item.chapa.number)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {item.chapa.candidateIds.map((cid, i) => (
                        <span
                          key={cid}
                          className="inline-flex items-center gap-1 bg-muted/40 px-2 py-0.5 rounded text-xs border border-border/30"
                        >
                          <span className="text-muted-foreground font-mono text-[10px]">
                            {i + 1}º
                          </span>
                          <span className="font-medium">
                            {candidatesById.get(cid)?.name || "Desconhecido"}
                          </span>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-right">{item.votes}</td>
                  <td className="py-3 px-4 font-mono text-muted-foreground text-right whitespace-nowrap">
                    {pct.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
