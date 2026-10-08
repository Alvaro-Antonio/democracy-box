import { describe, expect, it } from "vitest";

import { AppError, mapRpcError } from "./errors";

describe("errors", () => {
  it("mapRpcError mapeia mensagens conhecidas do Postgres", () => {
    expect(mapRpcError({ message: "ALREADY_VOTED" }).code).toBe("CONFLICT");
    expect(mapRpcError({ message: "ELECTION_NOT_OPEN" }).code).toBe("ELECTION_STATE");
    expect(mapRpcError({ message: "ELECTION_NOT_CLOSED" }).code).toBe("ELECTION_STATE");
    expect(mapRpcError({ message: "CHAPA_NOT_FOUND" }).code).toBe("NOT_FOUND");
    expect(mapRpcError({ message: "MAX_CANDIDATES" }).code).toBe("VALIDATION");
    expect(mapRpcError({ message: "CHAPAS_EXIST" }).code).toBe("CONFLICT");
  });

  it("mapRpcError mapeia código 28000 como UNAUTHENTICATED", () => {
    expect(mapRpcError({ code: "28000" }).code).toBe("UNAUTHENTICATED");
  });

  it("mapRpcError mapeia erros desconhecidos como INTERNAL", () => {
    expect(mapRpcError({ message: "boom unknown error" }).code).toBe("INTERNAL");
  });

  it("AppError retém o código de erro de domínio", () => {
    const err = new AppError("VALIDATION", "Entrada inválida");
    expect(err.code).toBe("VALIDATION");
    expect(err.message).toBe("Entrada inválida");
  });
});
