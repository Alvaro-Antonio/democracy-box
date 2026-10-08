import { describe, expect, it } from "vitest";

import { formatChapaNumber, normalizeVoteCode } from "./vote-code";

describe("normalizeVoteCode", () => {
  it("aceita o formato canônico", () => {
    expect(normalizeVoteCode("VR-ABCD-EFGH-JKLM")).toBe("VR-ABCD-EFGH-JKLM");
  });

  it("aceita minúsculas e espaços", () => {
    expect(normalizeVoteCode(" vr abcd efgh jklm ")).toBe("VR-ABCD-EFGH-JKLM");
  });

  it("aceita código sem hífens", () => {
    expect(normalizeVoteCode("VRABCDEFGHJKLM")).toBe("VR-ABCD-EFGH-JKLM");
  });

  it("aceita código sem o prefixo VR", () => {
    expect(normalizeVoteCode("ABCD-EFGH-JKLM")).toBe("VR-ABCD-EFGH-JKLM");
  });

  it("rejeita caracteres fora do alfabeto (0, O, 1, I)", () => {
    expect(normalizeVoteCode("VR-ABCD-EFGH-JKL0")).toBeNull();
    expect(normalizeVoteCode("VR-ABCD-EFGH-JKLO")).toBeNull();
    expect(normalizeVoteCode("VR-ABCD-EFGH-JKL1")).toBeNull();
    expect(normalizeVoteCode("VR-ABCD-EFGH-JKLI")).toBeNull();
  });

  it("rejeita tamanho incorreto", () => {
    expect(normalizeVoteCode("VR-ABCD")).toBeNull();
    expect(normalizeVoteCode("")).toBeNull();
    expect(normalizeVoteCode("VR-ABCD-EFGH-JKLM-N")).toBeNull();
  });
});

describe("formatChapaNumber", () => {
  it("usa ao menos dois dígitos", () => {
    expect(formatChapaNumber(1)).toBe("01");
    expect(formatChapaNumber(42)).toBe("42");
    expect(formatChapaNumber(325)).toBe("325");
  });
});
