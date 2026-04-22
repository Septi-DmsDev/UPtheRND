export type JobStatus = 'queued' | 'processing' | 'done' | 'failed';
export type EnhancementModel = 'standard' | 'portrait' | 'illustration';

export interface JobAsset {
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
}

export interface JobLog {
  at: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface JobOutput {
  storedName: string;
  mimeType: string;
  size: number;
  engine: string;
  durationMs: number;
  warnings?: string[];
}

export interface JobRecord {
  id: string;
  status: JobStatus;
  scale: 2 | 4;
  model: EnhancementModel;
  input: JobAsset;
  output?: JobOutput;
  error?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  finishedAt?: string;
  logs: JobLog[];
}

export interface JobPublicView extends JobRecord {
  urls: {
    result: string;
    input: string;
    output: string | null;
  };
}
