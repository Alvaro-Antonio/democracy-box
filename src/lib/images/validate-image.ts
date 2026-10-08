export interface ImageInput {
  type: string;
  size: number;
  bytes: Uint8Array;
}

export type ValidateImageResult =
  | { ok: true; ext: "jpg" | "png" | "webp" }
  | { ok: false; message: string };

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

/**
 * Valida o tamanho, tipo MIME e assinatura binária (magic bytes) da imagem.
 */
export function validateImage(input: ImageInput): ValidateImageResult {
  if (input.size > MAX_IMAGE_SIZE) {
    return { ok: false, message: "A foto deve ter no máximo 2MB." };
  }

  const { bytes, type } = input;
  if (!bytes || bytes.length < 3) {
    return { ok: false, message: "Arquivo corrompido ou incompleto." };
  }

  // 1. Verificação PNG: 89 50 4E 47 0D 0A 1A 0A
  const isPngBytes =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;

  if (isPngBytes) {
    if (type !== "image/png") {
      return { ok: false, message: "Tipo MIME inconsistente com conteúdo PNG." };
    }
    return { ok: true, ext: "png" };
  }

  // 2. Verificação JPEG: FF D8 FF
  const isJpegBytes = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (isJpegBytes) {
    if (type !== "image/jpeg" && type !== "image/jpg") {
      return { ok: false, message: "Tipo MIME inconsistente com conteúdo JPEG." };
    }
    return { ok: true, ext: "jpg" };
  }

  // 3. Verificação WebP: RIFF....WEBP (bytes 0..3 = RIFF e 8..11 = WEBP)
  if (bytes.length >= 12) {
    const isRiff =
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
    const isWebp =
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;

    if (isRiff && isWebp) {
      if (type !== "image/webp") {
        return { ok: false, message: "Tipo MIME inconsistente com conteúdo WebP." };
      }
      return { ok: true, ext: "webp" };
    }
  }

  return {
    ok: false,
    message: "Formato de imagem não suportado. Utilize apenas JPEG, PNG ou WebP.",
  };
}
