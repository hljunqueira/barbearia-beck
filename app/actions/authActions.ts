'use server';

import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth';

export interface AdminAuthResult {
  success: boolean;
  ok: boolean;
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
      return { success: false, ok: false, error: 'Digite a senha de acesso.' };
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
          ok: true,
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
        ok: true,
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
      ok: false,
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
        ok: true,
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
      ok: false,
      error: 'Falha na comunicação com o banco de dados Supabase.',
    };
  }
}

/**
 * Lista todos os usuários administradores do sistema (sem expor senhas).
 */
export async function listAdminUsersAction() {
  try {
    const users = await (prisma as any).adminUser.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return users.map((u: any) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Erro ao listar administradores:', error);
    return [];
  }
}

/**
 * Cria um novo usuário administrador com senha criptografada via scrypt.
 */
export async function createAdminUserAction(data: {
  name: string;
  username: string;
  password: string;
  role?: string;
}): Promise<{ ok: boolean; user?: any; error?: string }> {
  try {
    const name = data.name?.trim();
    const username = data.username?.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
    const password = data.password?.trim();

    if (!name || name.length < 2) {
      return { ok: false, error: 'O nome é obrigatório (mínimo 2 letras).' };
    }
    if (!username || username.length < 3) {
      return { ok: false, error: 'O usuário é obrigatório (mínimo 3 letras sem espaços).' };
    }
    if (!password || password.length < 6) {
      return { ok: false, error: 'A senha é obrigatória e deve ter pelo menos 6 caracteres.' };
    }

    const existing = await (prisma as any).adminUser.findUnique({
      where: { username },
    });
    if (existing) {
      return { ok: false, error: `O usuário "@${username}" já existe. Escolha outro.` };
    }

    const hashedPassword = hashPassword(password);
    const newUser = await (prisma as any).adminUser.create({
      data: {
        name,
        username,
        password: hashedPassword,
        role: data.role?.trim() || 'admin',
      },
    });

    return {
      ok: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        role: newUser.role,
        createdAt: newUser.createdAt.toISOString(),
      },
    };
  } catch (error: any) {
    console.error('Erro ao criar administrador:', error);
    return { ok: false, error: error?.message || 'Falha ao criar administrador.' };
  }
}

/**
 * Atualiza um administrador existente (nome, role ou nova senha).
 */
export async function updateAdminUserAction(
  id: string,
  data: {
    name?: string;
    role?: string;
    password?: string;
  }
): Promise<{ ok: boolean; error?: string }> {
  try {
    const updateData: any = {};
    if (data.name?.trim()) updateData.name = data.name.trim();
    if (data.role?.trim()) updateData.role = data.role.trim();
    if (data.password?.trim()) {
      if (data.password.trim().length < 6) {
        return { ok: false, error: 'A nova senha deve ter no mínimo 6 caracteres.' };
      }
      updateData.password = hashPassword(data.password.trim());
    }

    await (prisma as any).adminUser.update({
      where: { id },
      data: updateData,
    });

    return { ok: true };
  } catch (error: any) {
    console.error('Erro ao atualizar administrador:', error);
    return { ok: false, error: error?.message || 'Falha ao atualizar administrador.' };
  }
}

/**
 * Exclui um administrador garantindo proteção de auto-exclusão e último admin.
 */
export async function deleteAdminUserAction(
  id: string,
  currentAdminUsername: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const userToDelete = await (prisma as any).adminUser.findUnique({
      where: { id },
    });

    if (!userToDelete) {
      return { ok: false, error: 'Administrador não encontrado.' };
    }

    // Regra 1: Não permitir excluir a si mesmo
    if (
      userToDelete.username.toLowerCase() === currentAdminUsername.toLowerCase() ||
      userToDelete.name.toLowerCase() === currentAdminUsername.toLowerCase()
    ) {
      return { ok: false, error: 'Por segurança, você não pode excluir a sua própria conta ativa.' };
    }

    // Regra 2: Não permitir excluir se for o único admin
    const totalAdmins = await (prisma as any).adminUser.count();
    if (totalAdmins <= 1) {
      return { ok: false, error: 'O sistema deve manter pelo menos um administrador cadastrado.' };
    }

    await (prisma as any).adminUser.delete({
      where: { id },
    });

    return { ok: true };
  } catch (error: any) {
    console.error('Erro ao excluir administrador:', error);
    return { ok: false, error: error?.message || 'Falha ao excluir administrador.' };
  }
}

