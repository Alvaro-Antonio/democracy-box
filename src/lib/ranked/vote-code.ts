/**
 * Código de verificação do voto: `VR-XXXX-XXXX-XXXX`.
 *
 * O alfabeto exclui caracteres ambíguos (0/O, 1/I) para facilitar a
 * leitura e a digitação. São 32 símbolos × 12 posições ≈ 60 bits de
 * entropia — inviável de adivinhar por força bruta.
 *
 * A geração acontece no banco (função `cast_vote`); aqui só normalizamos
 * o que o usuário digita na página de validação.
 */

export const VOTE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const VOTE_CODE_PREFIX = "VR";
const BODY_LENGTH = 12;
const GROUP_SIZE = 4;

const BODY_PATTERN = new RegExp(`^[${VOTE_CODE_ALPHABET}]{${BODY_LENGTH}}$`);

/**
 * Converte a entrada do usuário para o formato canônico.
 * Tolera minúsculas, espaços, ausência de hífens e ausência do prefixo.
 * Retorna `null` se a entrada não puder ser um código válido.
 */
export function normalizeVoteCode(input: string): string | null {
  let compact = input.toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (compact.length === BODY_LENGTH + VOTE_CODE_PREFIX.length && compact.startsWith(VOTE_CODE_PREFIX)) {
    compact = compact.slice(VOTE_CODE_PREFIX.length);
  }

  if (!BODY_PATTERN.test(compact)) return null;

  const groups: string[] = [];
  for (let i = 0; i < BODY_LENGTH; i += GROUP_SIZE) {
    groups.push(compact.slice(i, i + GROUP_SIZE));
  }
  return [VOTE_CODE_PREFIX, ...groups].join("-");
}

/** Número de chapa exibido com no mínimo dois dígitos (01, 02, …, 325). */
export function formatChapaNumber(n: number): string {
  return String(n).padStart(2, "0");
}
