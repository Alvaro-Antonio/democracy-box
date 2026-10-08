import { describe, expect, it } from "vitest";

import { runInstantRunoff } from "./irv";

const ABC = ["A", "B", "C"];

describe("runInstantRunoff", () => {
  it("declara vencedor na 1ª rodada quando há maioria absoluta", () => {
    const r = runInstantRunoff(ABC, [
      { ranking: ["A"], count: 3 },
      { ranking: ["B"], count: 1 },
    ]);
    expect(r.winner).toBe("A");
    expect(r.rounds).toHaveLength(1);
    expect(r.totalBallots).toBe(4);
  });

  it("transfere votos do eliminado para a próxima preferência", () => {
    const r = runInstantRunoff(ABC, [
      { ranking: ["A"], count: 4 },
      { ranking: ["B"], count: 3 },
      { ranking: ["C", "B"], count: 2 },
    ]);
    expect(r.rounds[0].eliminated).toBe("C");
    expect(r.rounds[0].tieBreak).toBeNull();
    expect(r.rounds[1].tallies).toEqual({ A: 4, B: 5 });
    expect(r.winner).toBe("B");
  });

  it("conta cédulas esgotadas e usa ordem de cadastro no empate sem histórico", () => {
    const r = runInstantRunoff(ABC, [
      { ranking: ["A"], count: 3 },
      { ranking: ["B"], count: 2 },
      { ranking: ["C"], count: 2 },
    ]);
    expect(r.rounds[0].eliminated).toBe("C");
    expect(r.rounds[0].tieBreak).toBe("registration-order");
    expect(r.rounds[1].exhausted).toBe(2);
    expect(r.rounds[1].activeBallots).toBe(5);
    expect(r.winner).toBe("A");
  });

  it("desempata pela rodada anterior", () => {
    const r = runInstantRunoff(
      ["A", "B", "C", "D"],
      [
        { ranking: ["A"], count: 6 },
        { ranking: ["B"], count: 3 },
        { ranking: ["C"], count: 2 },
        { ranking: ["D", "C"], count: 1 },
      ],
    );
    expect(r.rounds[0].eliminated).toBe("D");
    expect(r.rounds[1].eliminated).toBe("C");
    expect(r.rounds[1].tieBreak).toBe("previous-round");
    expect(r.rounds[2].exhausted).toBe(3);
    expect(r.winner).toBe("A");
  });

  it("retorna sem vencedor e sem rodadas quando não há votos", () => {
    const r = runInstantRunoff(ABC, []);
    expect(r.winner).toBeNull();
    expect(r.rounds).toEqual([]);
    expect(r.totalBallots).toBe(0);
  });

  it("inclui candidatos sem votos com 0 e os elimina primeiro", () => {
    const r = runInstantRunoff(ABC, [
      { ranking: ["A"], count: 2 },
      { ranking: ["B"], count: 2 },
    ]);
    expect(r.rounds[0].tallies).toEqual({ A: 2, B: 2, C: 0 });
    expect(r.rounds[0].eliminated).toBe("C");
    expect(r.rounds[0].tieBreak).toBeNull();
  });

  it("encerra quando resta um único candidato", () => {
    const r = runInstantRunoff(["A", "B"], [
      { ranking: ["A"], count: 1 },
      { ranking: ["B"], count: 1 },
    ]);
    // empate 1x1 sem histórico → B (cadastrado por último) é eliminado
    expect(r.rounds[0].eliminated).toBe("B");
    expect(r.winner).toBe("A");
    expect(r.rounds).toHaveLength(2);
  });

  it("ignora candidatos desconhecidos nas cédulas", () => {
    const r = runInstantRunoff(["A"], [{ ranking: ["X", "A"], count: 1 }]);
    expect(r.winner).toBe("A");
  });
});
