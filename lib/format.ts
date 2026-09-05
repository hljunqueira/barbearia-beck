const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/** Formata centavos em moeda brasileira: 14990 -> "R$ 149,90" */
export const formatBRL = (cents: number): string => brl.format(cents / 100);

/** Separa inteiro e decimais para composição tipográfica: 14990 -> { integer: "149", decimal: "90" } */
export const splitPrice = (cents: number): { integer: string; decimal: string } => ({
  integer: Math.floor(cents / 100).toLocaleString('pt-BR'),
  decimal: String(cents % 100).padStart(2, '0'),
});

/** Percentual de desconto arredondado: (16970, 14990) -> 12 */
export const discountPercent = (compareAt: number, price: number): number =>
  Math.round(((compareAt - price) / compareAt) * 100);
