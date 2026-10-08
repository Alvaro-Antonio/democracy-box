import { describe, expect, it } from "vitest";

import { isAdminEmail, parseAdminEmails } from "./admin-emails";

describe("admin-emails", () => {
  it("parseAdminEmails normaliza espaços, vazios e minúsculas", () => {
    expect(parseAdminEmails(" Admin@X.com ,b@y.com,, ")).toEqual(["admin@x.com", "b@y.com"]);
    expect(parseAdminEmails(undefined)).toEqual([]);
    expect(parseAdminEmails("")).toEqual([]);
  });

  it("isAdminEmail valida case-insensitively e rejeita e-mails não autorizados", () => {
    expect(isAdminEmail("ADMIN@x.com", ["admin@x.com"])).toBe(true);
    expect(isAdminEmail("admin@x.com", ["admin@x.com"])).toBe(true);
    expect(isAdminEmail("other@x.com", ["admin@x.com"])).toBe(false);
    expect(isAdminEmail(null, ["admin@x.com"])).toBe(false);
    expect(isAdminEmail(undefined, ["admin@x.com"])).toBe(false);
    expect(isAdminEmail("admin@x.com", [])).toBe(false);
  });
});
