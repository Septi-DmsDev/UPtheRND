import { NextResponse } from 'next/server';
import { ensureStorageDirectories } from '@/lib/paths';

export const runtime = 'nodejs';

export async function GET() {
  await ensureStorageDirectories();

  return NextResponse.json({ ok: true, service: 'web' });
}
