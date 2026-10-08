import { describe, expect, it } from "vitest";

import { generateChapaRankings } from "./permutations";

const ids = (n: number) => ["a", "b", "c", "d", "e"].slice(0, n);

describe("generateChapaRankings", () => {
  it("gera a quantidade correta de chapas para 0..5 candidatos", () => {
    expect([0, 1, 2, 3, 4, 5].map((n) => generateChapaRankings(ids(n)).length)).toEqual([
      0, 1, 4, 15, 64, 325,
    ]);
  });

  it("ordena por tamanho e depois lexicograficamente", () => {
    expect(generateChapaRankings(ids(2))).toEqual([["a"], ["b"], ["a", "b"], ["b", "a"]]);
  });

  it("não gera chapas repetidas nem candidatos repetidos na mesma chapa", () => {
    const rankings = generateChapaRankings(ids(5));
    expect(new Set(rankings.map((r) => r.join())).size).toBe(325);
    expect(rankings.every((r) => new Set(r).size === r.length)).toBe(true);
  });

  it("rejeita mais de 5 candidatos", () => {
    expect(() => generateChapaRankings(["a", "b", "c", "d", "e", "f"])).toThrow();
  });

  it("rejeita ids duplicados", () => {
    expect(() => generateChapaRankings(["a", "a"])).toThrow();
  });
});
