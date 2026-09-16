import crypto from 'crypto';

/**
 * Utilitários de Hash e Validação de Senhas para Administradores da Beck Barbearia.
 * Utiliza scrypt nativo do Node.js com salt aleatório e comparação segura de tempo.
 */

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !password) return false;

  // Se o hash estiver no formato salt:key
  if (storedHash.includes(':')) {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;

    try {
      const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
      const keyBuffer = Buffer.from(key, 'hex');
      const derivedBuffer = Buffer.from(derivedKey, 'hex');

      if (keyBuffer.length !== derivedBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(keyBuffer, derivedBuffer);
    } catch {
      return false;
    }
  }

  // Fallback caso senha tenha sido salva sem hash
  return password === storedHash;
}
