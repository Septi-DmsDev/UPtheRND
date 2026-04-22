import { NextResponse } from 'next/server';
import { readJob, toPublicJob } from '@/lib/jobs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await readJob(id);

  if (!job) {
    return NextResponse.json({ error: 'Job tidak ditemukan.' }, { status: 404 });
  }

  return NextResponse.json({ job: toPublicJob(job) });
}
