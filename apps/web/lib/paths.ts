import 'server-only';

import path from 'node:path';
import { promises as fs } from 'node:fs';
import { appConfig } from './config';

export async function ensureStorageDirectories() {
  await Promise.all([
    fs.mkdir(appConfig.uploadsDir, { recursive: true }),
    fs.mkdir(appConfig.outputsDir, { recursive: true }),
    fs.mkdir(appConfig.jobsDir, { recursive: true }),
  ]);
}

export function filePathForUpload(storedName: string) {
  return path.join(appConfig.uploadsDir, storedName);
}

export function filePathForOutput(storedName: string) {
  return path.join(appConfig.outputsDir, storedName);
}

export function filePathForJob(id: string) {
  return path.join(appConfig.jobsDir, `${id}.json`);
}
