import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Endpoint de upload de fotos da Beck Barbearia.
 * Salva diretamente no bucket público `beck-media` do Supabase Storage.
 * Retorna a URL pública pronta para salvar no banco de dados.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    // Validação de tipo MIME
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: 'Formato inválido. Envie imagem PNG, JPG, WEBP ou AVIF.' },
        { status: 400 },
      );
    }

    // Tamanho máximo de 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { ok: false, error: 'Tamanho excedido. O arquivo deve ter no máximo 10MB.' },
        { status: 400 },
      );
    }

    // Sanitizar nome do arquivo
    const extension = file.name.split('.').pop()?.toLowerCase() || 'webp';
    const cleanBaseName = file.name
      .replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    const fileName = `${Date.now()}-${cleanBaseName}.${extension}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from('beck-media')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      return NextResponse.json(
        { ok: false, error: `Falha no upload: ${uploadError.message}` },
        { status: 500 },
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('beck-media')
      .getPublicUrl(fileName);

    return NextResponse.json({
      ok: true,
      url: publicUrlData.publicUrl,
      fileName,
    });
  } catch (error: any) {
    console.error('Upload route error:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Erro interno ao processar upload.' },
      { status: 500 },
    );
  }
}
