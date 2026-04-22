import 'server-only';

import { promises as fs } from 'node:fs';
import { filePathForJob, ensureStorageDirectories } from './paths';
import { appConfig } from './config';
import type { JobAsset, JobPublicView, JobRecord, EnhancementModel } from './types';

function nowIso() {
  return new Date().toISOString();
}

async function writeAtomic(filePath: string, value: string) {
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, value, 'utf8');
  await fs.rename(tempPath, filePath);
}

export function createJob({
  id,
  input,
  scale,
  model,
}: {
  id: string;
  input: JobAsset;
  scale: 2 | 4;
  model: EnhancementModel;
}): JobRecord {
  const timestamp = nowIso();
  return {
    id,
    input,
    scale,
    model,
    status: 'queued',
    createdAt: timestamp,
    updatedAt: timestamp,
    logs: [
      {
        at: timestamp,
        level: 'info',
        message: 'Job created and queued for worker pickup.',
      },
    ],
  };
}

export async function saveJob(job: JobRecord) {
  await ensureStorageDirectories();
  await writeAtomic(filePathForJob(job.id), JSON.stringify(job, null, 2));
}

export async function readJob(id: string): Promise<JobRecord | null> {
  try {
    const raw = await fs.readFile(filePathForJob(id), 'utf8');
    return JSON.parse(raw) as JobRecord;
  } catch {
    return null;
  }
}

export async function listJobs(limit = 8): Promise<JobRecord[]> {
  await ensureStorageDirectories();
  const jobDirectoryEntries = await fs.readdir(appConfig.jobsDir, { withFileTypes: true });
  const jobFiles = jobDirectoryEntries.filter((entry) => entry.isFile() && entry.name.endsWith('.json'));
  const jobs = await Promise.all(
    jobFiles.map(async (entry) => {
      const jobId = entry.name.replace(/\.json$/, '');
      return readJob(jobId);
    }),
  );

  return jobs
    .filter((job): job is JobRecord => Boolean(job))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, limit);
}

export function toPublicJob(job: JobRecord): JobPublicView {
  return {
    ...job,
    urls: {
      result: `/result/${job.id}`,
      input: `/api/download/${job.id}?kind=input`,
      output: job.output ? `/api/download/${job.id}?kind=output` : null,
    },
  };
}
