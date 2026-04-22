import { promises as fs } from 'node:fs';
import { NextResponse } from 'next/server';
import { readJob } from '@/lib/jobs';
import { filePathForOutput, filePathForUpload } from '@/lib/paths';

export const runtime = 'nodejs';

function buildInlineDisposition(filename: string) {
  return `inline; filename="${filename.replace(/"/g, '')}"`;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const url = new URL(request.url);
  const { id } = await params;
  const kind = url.searchParams.get('kind') === 'input' ? 'input' : 'output';
  const job = await readJob(id);

  if (!job) {
    return NextResponse.json({ error: 'Job tidak ditemukan.' }, { status: 404 });
  }

  if (kind === 'output' && !job.output) {
    return NextResponse.json({ error: 'Output job belum tersedia.' }, { status: 404 });
  }

  const storedName = kind === 'input' ? job.input.storedName : job.output!.storedName;
  const filePath = kind === 'input' ? filePathForUpload(storedName) : filePathForOutput(storedName);
  const mimeType = kind === 'input' ? job.input.mimeType : job.output!.mimeType;
  const inlineName = kind === 'input' ? job.input.originalName : `${job.id}-enhanced.png`;

  try {
    const buffer = await fs.readFile(filePath);
    return new Response(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Length': String(buffer.byteLength),
        'Content-Disposition': buildInlineDisposition(inlineName),
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'File tidak ditemukan pada storage.' }, { status: 404 });
  }
}
