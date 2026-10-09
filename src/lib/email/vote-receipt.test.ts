import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { sendVoteReceiptEmail } from "./vote-receipt";

describe("sendVoteReceiptEmail", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("utiliza dev_logger de forma segura quando RESEND_API_KEY não está definida", async () => {
    delete process.env.RESEND_API_KEY;

    const result = await sendVoteReceiptEmail({
      to: "eleitor@exemplo.com",
      code: "VR-ABCD-1234-EFGH",
      chapaNumber: 1,
    });

    expect(result.sent).toBe(true);
    expect(result.provider).toBe("dev_logger");
  });

  it("chama a API do Resend com payload correto quando RESEND_API_KEY estiver configurada", async () => {
    process.env.RESEND_API_KEY = "re_test_key_123";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "msg_123" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendVoteReceiptEmail({
      to: "eleitor@exemplo.com",
      code: "VR-ABCD-1234-EFGH",
      chapaNumber: 3,
    });

    expect(result.sent).toBe(true);
    expect(result.provider).toBe("resend");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe("Bearer re_test_key_123");

    const body = JSON.parse(options.body as string);
    expect(body.to).toEqual(["eleitor@exemplo.com"]);
    expect(body.subject).toContain("VR-ABCD-1234-EFGH");
    expect(body.html).toContain("VR-ABCD-1234-EFGH");
    expect(body.html).toContain("Chapa #03");
  });

  it("não quebra nem lança erro fatal quando a API externa retornar falha", async () => {
    process.env.RESEND_API_KEY = "re_test_key_123";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      text: async () => "Rate limit exceeded",
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendVoteReceiptEmail({
      to: "eleitor@exemplo.com",
      code: "VR-ABCD-1234-EFGH",
      chapaNumber: 3,
    });

    expect(result.sent).toBe(false);
    expect(result.provider).toBe("resend");
    expect(result.error).toBe("Rate limit exceeded");
  });
});
