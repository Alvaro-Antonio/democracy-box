import { describe, expect, it } from "vitest";

import { validateImage } from "./validate-image";

describe("validateImage", () => {
  it("aceita PNG válido com magic bytes", () => {
    const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    const res = validateImage({
      type: "image/png",
      size: 1024,
      bytes: pngBytes,
    });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.ext).toBe("png");
  });

  it("aceita JPEG válido com magic bytes", () => {
    const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    const res = validateImage({
      type: "image/jpeg",
      size: 1024,
      bytes: jpegBytes,
    });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.ext).toBe("jpg");
  });

  it("aceita WebP válido com magic bytes", () => {
    // RIFF (4 bytes) + 4 bytes tamanho + WEBP (4 bytes)
    const webpBytes = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    ]);
    const res = validateImage({
      type: "image/webp",
      size: 1024,
      bytes: webpBytes,
    });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.ext).toBe("webp");
  });

  it("rejeita arquivo com MIME declarado incorreto ou adulterado", () => {
    // Declarou PNG mas enviou bytes de GIF (GIF89a: 0x47, 0x49, 0x46, 0x38)
    const fakeBytes = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
    const res = validateImage({
      type: "image/png",
      size: 1024,
      bytes: fakeBytes,
    });
    expect(res.ok).toBe(false);
  });

  it("rejeita imagem maior que 2MB", () => {
    const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const res = validateImage({
      type: "image/png",
      size: 2 * 1024 * 1024 + 1,
      bytes: pngBytes,
    });
    expect(res.ok).toBe(false);
  });

  it("rejeita formato não suportado (ex: GIF, SVG)", () => {
    const gifBytes = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
    const res = validateImage({
      type: "image/gif",
      size: 1024,
      bytes: gifBytes,
    });
    expect(res.ok).toBe(false);
  });
});
