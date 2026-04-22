import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { NextResponse } from 'next/server';
import { appConfig } from '@/lib/config';
import { filePathForUpload, ensureStorageDirectories } from '@/lib/paths';
import { createJob, listJobs, saveJob, toPublicJob } from '@/lib/jobs';
import { getExtensionFromFile, validateUpload } from '@/lib/files';
import type { EnhancementModel } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseScale(value: FormDataEntryValue | null): 2 | 4 {
  return String(value) === '4' ? 4 : 2;
}

function parseModel(value: FormDataEntryValue | null): EnhancementModel {
  const model = String(value || 'standard');
  if (model === 'portrait' || model === 'illustration') {
    return model;
  }
  return 'standard';
}

export async function GET() {
  await ensureStorageDirectories();
  const jobs = (await listJobs(12)).map(toPublicJob);
  return NextResponse.json({ jobs });
}

export async function POST(request: Request) {
  await ensureStorageDirectories();
  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'File upload wajib diisi.' }, { status: 400 });
  }

  const validationError = validateUpload(file, appConfig.maxUploadBytes);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const id = `job_${randomUUID()}`;
  const storedName = `${id}${getExtensionFromFile(file)}`;
  const uploadPath = filePathForUpload(storedName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(uploadPath, buffer);

  const job = createJob({
    id,
    input: {
      originalName: file.name,
      storedName,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
    },
    scale: parseScale(formData.get('scale')),
    model: parseModel(formData.get('model')),
  });

  await saveJob(job);

  return NextResponse.json({ job: toPublicJob(job) }, { status: 201 });
}
