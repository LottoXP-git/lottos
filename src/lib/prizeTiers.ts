export interface PremiacaoLike {
  descricao?: string;
  faixa?: number;
  ganhadores?: number;
  valorPremio?: number;
}

/**
 * Retorna a faixa principal (maior prêmio) de um rateio da Caixa.
 * A API nem sempre devolve a lista ordenada, então escolhemos a menor
 * `faixa` (1 = prêmio principal) e, em empate/ausência, o maior valor.
 */
export function getMainTier<T extends PremiacaoLike>(premiacoes: T[] | undefined): T | undefined {
  if (!premiacoes || premiacoes.length === 0) return undefined;
  const withFaixa = premiacoes.filter((p) => typeof p.faixa === "number" && (p.faixa as number) > 0);
  if (withFaixa.length > 0) {
    return withFaixa.reduce((best, p) => ((p.faixa as number) < (best.faixa as number) ? p : best));
  }
  return premiacoes.reduce((best, p) => ((p.valorPremio || 0) > (best.valorPremio || 0) ? p : best));
}

/** Quantidade de ganhadores na faixa principal. */
export function getMainTierWinners(premiacoes: PremiacaoLike[] | undefined): number {
  const tier = getMainTier(premiacoes);
  return tier?.ganhadores ?? 0;
}
