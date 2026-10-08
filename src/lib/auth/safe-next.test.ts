import { describe, expect, it } from "vitest";

import { safeNextPath } from "./safe-next";

describe("safeNextPath", () => {
  it("aceita caminhos relativos seguros", () => {
    expect(safeNextPath("/votar")).toBe("/votar");
    expect(safeNextPath("/admin/candidatos")).toBe("/admin/candidatos");
    expect(safeNextPath("/resultado?foo=bar")).toBe("/resultado?foo=bar");
  });

  it("bloqueia ataques de open-redirect e caminhos inválidos", () => {
    expect(safeNextPath("//evil.com")).toBe("/");
    expect(safeNextPath("https://evil.com")).toBe("/");
    expect(safeNextPath("javascript:alert(1)")).toBe("/");
    expect(safeNextPath("")).toBe("/");
    expect(safeNextPath(null)).toBe("/");
    expect(safeNextPath(undefined)).toBe("/");
  });
});
