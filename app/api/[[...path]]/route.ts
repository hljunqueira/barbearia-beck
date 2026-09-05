import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { plansRepository, productsRepository } from '@/lib/repositories';

/**
 * API REST (somente leitura) — espelha as Server Actions para consumo externo
 * (apps, integrações, testes). Fonte de dados: lib/repositories.ts.
 *
 * GET /api            -> health check (inclui ping no MongoDB)
 * GET /api/plans      -> planos do Clube da Barba
 * GET /api/products   -> catálogo de produtos
 */

let client: MongoClient | null = null;

async function pingMongo(): Promise<boolean> {
  try {
    if (!client) {
      client = new MongoClient(process.env.MONGO_URL as string);
      await client.connect();
    }
    await client.db(process.env.DB_NAME).command({ ping: 1 });
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
      return withCors(
        NextResponse.json({
          ok: true,
          service: 'beck-barbearia',
          database: (await pingMongo()) ? 'connected' : 'unavailable',
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
