import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

async function main() {
  console.log('👤 Criando / atualizando usuário administrador Henrique no Supabase PostgreSQL...');

  const hashedPassword = hashPassword('183834@Hlj');

  const admin = await prisma.adminUser.upsert({
    where: { username: 'henrique' },
    update: {
      name: 'Henrique',
      password: hashedPassword,
      role: 'admin',
    },
    create: {
      username: 'henrique',
      name: 'Henrique',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('✅ Usuário administrador configurado com sucesso:');
  console.log(`   ID: ${admin.id}`);
  console.log(`   Username: ${admin.username}`);
  console.log(`   Nome: ${admin.name}`);
  console.log(`   Role: ${admin.role}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao criar usuário admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
