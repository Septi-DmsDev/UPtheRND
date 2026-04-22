const defaultScale = Number.parseInt(process.env.DEFAULT_SCALE ?? '2', 10);
const allowedScales = (process.env.ALLOWED_SCALES ?? '2,4')
  .split(',')
  .map((value) => Number.parseInt(value.trim(), 10))
  .filter((value): value is 2 | 4 => value === 2 || value === 4);

export const appConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'UPtheRND',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  maxUploadMb: Number.parseInt(process.env.MAX_UPLOAD_MB ?? '5', 10),
  maxUploadBytes: Number.parseInt(process.env.MAX_UPLOAD_MB ?? '5', 10) * 1024 * 1024,
  uploadsDir: process.env.UPLOADS_DIR ?? '/data/uploads',
  outputsDir: process.env.OUTPUTS_DIR ?? '/data/outputs',
  jobsDir: process.env.JOBS_DIR ?? '/data/jobs',
  defaultScale: defaultScale === 4 ? 4 : 2,
  allowedScales: allowedScales.length ? allowedScales : ([2, 4] as Array<2 | 4>),
};
