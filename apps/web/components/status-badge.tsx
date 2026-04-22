import type { JobStatus } from '@/lib/types';

const labels: Record<JobStatus, string> = {
  queued: 'Queued',
  processing: 'Processing',
  done: 'Done',
  failed: 'Failed',
};

export function StatusBadge({ status }: { status: JobStatus }) {
  return <span className={`status-badge status-${status}`}>{labels[status]}</span>;
}
