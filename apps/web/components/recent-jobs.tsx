import Link from 'next/link';
import { formatDateTime, formatDuration, formatLabel } from '@/lib/format';
import type { JobPublicView } from '@/lib/types';
import { StatusBadge } from './status-badge';

export function RecentJobs({ jobs }: { jobs: JobPublicView[] }) {
  if (jobs.length === 0) {
    return <div className="empty-state">Belum ada job. Upload gambar pertama untuk memulai pipeline.</div>;
  }

  return (
    <div className="recent-jobs">
      {jobs.map((job) => (
        <article key={job.id} className="job-card">
          <div className="job-card-top">
            <div>
              <h3>{job.input.originalName}</h3>
              <p className="muted-copy small-text">{job.id}</p>
            </div>
            <StatusBadge status={job.status} />
          </div>
          <div className="job-chip-row">
            <span className="job-chip">Scale {job.scale}x</span>
            <span className="job-chip">Mode {formatLabel(job.model)}</span>
            <span className="job-chip">Created {formatDateTime(job.createdAt)}</span>
            {job.output?.durationMs ? <span className="job-chip">{formatDuration(job.output.durationMs)}</span> : null}
          </div>
          <div className="job-actions">
            <Link href={job.urls.result} className="button button-secondary">
              Buka detail
            </Link>
            {job.urls.output ? (
              <a className="button button-ghost" href={job.urls.output} download>
                Download
              </a>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
