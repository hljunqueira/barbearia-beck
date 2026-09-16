import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { plansRepository, productsRepository, servicesRepository } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

/**
 * API REST oficial — Beck Barbearia
 *
 * GET /api            -> health check (status da aplicação e PostgreSQL Supabase)
 * GET /api/plans      -> planos oficiais do Clube da Barba
 * GET /api/products   -> catálogo de produtos
 * GET /api/services   -> catálogo de serviços
 */

async function pingDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

function withCors(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

type RouteContext = { params: Promise<{ path?: string[] }> };

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { path = [] } = await params;
  const route = `/${path.join('/')}`;

  try {
    if (route === '/' || route === '/health') {
      const isDbOk = await pingDatabase();
      return withCors(
        NextResponse.json({
          ok: true,
          service: 'beck-barbearia',
          database: isDbOk ? 'connected' : 'unavailable',
          databaseEngine: 'Supabase PostgreSQL',
          domain: 'beckbarbearia.com.br',
          timestamp: new Date().toISOString(),
        }),
      );
    }

    if (route === '/plans') {
      const plans = await plansRepository.list();
      return withCors(NextResponse.json({ ok: true, data: plans }));
    }

    if (route === '/products') {
      const products = await productsRepository.list();
      return withCors(NextResponse.json({ ok: true, data: products }));
    }

    if (route === '/services') {
      const services = await servicesRepository.list();
      return withCors(NextResponse.json({ ok: true, data: services }));
    }

    return withCors(
      NextResponse.json({ ok: false, error: `Rota ${route} não encontrada` }, { status: 404 }),
    );
  } catch (error) {
    console.error('API error:', error);
    return withCors(
      NextResponse.json({ ok: false, error: 'Erro interno do servidor' }, { status: 500 }),
    );
  }
}
