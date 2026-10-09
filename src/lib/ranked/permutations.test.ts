import { describe, expect, it } from "vitest";

import { generateChapaRankings } from "./permutations";

const ids = (n: number) => ["a", "b", "c", "d", "e"].slice(0, n);

describe("generateChapaRankings", () => {
  it("gera a quantidade correta de chapas completas (n!) para 0..5 candidatos", () => {
    // 0!=0 (no candidates), 1!=1, 2!=2, 3!=6, 4!=24, 5!=120
    expect([0, 1, 2, 3, 4, 5].map((n) => generateChapaRankings(ids(n)).length)).toEqual([
      0, 1, 2, 6, 24, 120,
    ]);
  });

  it("ordena lexicograficamente contendo todos os candidatos", () => {
    expect(generateChapaRankings(ids(2))).toEqual([["a", "b"], ["b", "a"]]);
  });

  it("garante que todas as chapas contêm exatamente todos os 5 candidatos", () => {
    const rankings = generateChapaRankings(ids(5));
    expect(rankings.length).toBe(120);
    expect(new Set(rankings.map((r) => r.join())).size).toBe(120);
    expect(rankings.every((r) => r.length === 5 && new Set(r).size === 5)).toBe(true);
  });

  it("rejeita mais de 5 candidatos", () => {
    expect(() => generateChapaRankings(["a", "b", "c", "d", "e", "f"])).toThrow();
  });

  it("rejeita ids duplicados", () => {
    expect(() => generateChapaRankings(["a", "a"])).toThrow();
  });
});
