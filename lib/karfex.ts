/**
 * karfex — camada de integração (reservada).
 *
 * Este módulo concentra o contrato tipado com a futura API karfex
 * (checkout / assinaturas recorrentes). Enquanto a API não está conectada,
 * as funções lançam `KarfexNotConfiguredError` e a UI usa fallbacks.
 *
 * Para ativar:
 *  1. Definir KARFEX_API_URL e KARFEX_API_KEY no .env
 *  2. Implementar as funções abaixo mantendo as assinaturas
 *  3. Preencher `karfexPlanId` / `karfexProductId` nos dados
 *  4. Trocar os repositórios em lib/repositories.ts, se a fonte de planos passar a ser a karfex
 */

export interface KarfexConfig {
  readonly baseUrl: string;
  readonly apiKey: string;
}

export interface KarfexCheckoutInput {
  readonly planId: string;
  readonly customerEmail?: string;
  readonly successUrl?: string;
  readonly cancelUrl?: string;
}

export interface KarfexCheckoutSession {
  readonly id: string;
  readonly url: string;
  readonly expiresAt: string;
}

export class KarfexNotConfiguredError extends Error {
  constructor() {
    super('karfex: integração não configurada (defina KARFEX_API_URL e KARFEX_API_KEY).');
    this.name = 'KarfexNotConfiguredError';
  }
}

export const getKarfexConfig = (): KarfexConfig | null => {
  const baseUrl = process.env.KARFEX_API_URL;
  const apiKey = process.env.KARFEX_API_KEY;

  return baseUrl && apiKey ? { baseUrl, apiKey } : null;
};

export const isKarfexEnabled = (): boolean => getKarfexConfig() !== null;

export async function createCheckoutSession(
  _input: KarfexCheckoutInput,
): Promise<KarfexCheckoutSession> {
  const config = getKarfexConfig();

  if (!config) {
    throw new KarfexNotConfiguredError();
  }

  // TODO(karfex): POST `${config.baseUrl}/checkout/sessions` com Authorization: Bearer config.apiKey
  throw new Error('karfex: createCheckoutSession ainda não implementado.');
}
