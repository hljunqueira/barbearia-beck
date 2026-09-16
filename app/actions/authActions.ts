'use server';

import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth';

export interface AdminAuthResult {
  success: boolean;
  user?: {
    id: string;
    name: string;
    username: string;
    role: string;
  };
  error?: string;
}

/**
 * Autentica o usuário administrador no Supabase PostgreSQL.
 */
export async function loginAdminAction(
  usernameInput: string,
  passwordInput: string
): Promise<AdminAuthResult> {
  try {
    const rawUsername = (usernameInput || '').trim();
    const rawPassword = (passwordInput || '').trim();

    if (!rawPassword) {
      return { success: false, error: 'Digite a senha de acesso.' };
    }

    const normalizedUsername = (rawUsername || 'henrique').toLowerCase();

    // 1. Busca no banco de dados Supabase
    let adminUser = await (prisma as any).adminUser.findUnique({
      where: { username: normalizedUsername },
    });

    // Se o usuário Henrique ainda não existir no banco, cria na hora
    if (!adminUser && (normalizedUsername === 'henrique' || normalizedUsername === 'admin')) {
      if (rawPassword === '183834@Hlj' || rawPassword === 'beck2026') {
        const hashedPassword = hashPassword('183834@Hlj');
        adminUser = await (prisma as any).adminUser.create({
          data: {
            username: 'henrique',
            name: 'Henrique',
            password: hashedPassword,
            role: 'admin',
          },
        });
      }
    }

    // 2. Se encontrou o usuário, valida a senha com hash seguro
    if (adminUser) {
      const isValid = verifyPassword(rawPassword, adminUser.password);
      if (isValid) {
        return {
          success: true,
          user: {
            id: adminUser.id,
            name: adminUser.name,
            username: adminUser.username,
            role: adminUser.role,
          },
        };
      }
    }

    // 3. Fallback mestre de segurança para Henrique / beck2026
    if (
      (normalizedUsername === 'henrique' || normalizedUsername === 'admin' || !rawUsername) &&
      (rawPassword === '183834@Hlj' || rawPassword === 'beck2026')
    ) {
      return {
        success: true,
        user: {
          id: 'admin-henrique',
          name: 'Henrique',
          username: 'henrique',
          role: 'admin',
        },
      };
    }

    return {
      success: false,
      error: 'Usuário ou senha incorretos. Verifique os dados.',
    };
  } catch (error) {
    console.error('Erro na autenticação de administrador:', error);
    // Em caso de falha de conexão com banco, ainda aceita a credencial mestre
    if (
      (usernameInput.toLowerCase().trim() === 'henrique' || !usernameInput.trim()) &&
      (passwordInput.trim() === '183834@Hlj' || passwordInput.trim() === 'beck2026')
    ) {
      return {
        success: true,
        user: {
          id: 'admin-henrique',
          name: 'Henrique',
          username: 'henrique',
          role: 'admin',
        },
      };
    }

    return {
      success: false,
      error: 'Ocorreu um erro ao processar o login. Tente novamente.',
    };
  }
}
