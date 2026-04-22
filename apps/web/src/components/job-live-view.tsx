'use client';

import { useEffect, useMemo, useState } from 'react';
import { BeforeAfterComparison } from '@/components/before-after-comparison';
import { StatusBadge } from '@/components/status-badge';
import { formatBytes, formatDateTime, formatDuration, formatLabel } from '@/lib/format';
import type { JobPublicView } from '@/lib/types';

export function JobLiveView({ initialJob }: { initialJob: JobPublicView }) {
  const [job, setJob] = useState(initialJob);
  const [pollError, setPollError] = useState('');

  const isTerminal = job.status === 'done' || job.status === 'failed';

  useEffect(() => {
    if (isTerminal) {
      return undefined;
    }

    let alive = true;

    async function refreshJob() {
      try {
        const response = await fetch(`/api/jobs/${job.id}`, { cache: 'no-store' });
        const data = (await response.json()) as { error?: string; job?: JobPublicView };

        if (!response.ok || !data.job) {
          throw new Error(data.error || 'Gagal membaca status job.');
        }

        if (!alive) return;
        setJob(data.job);
        setPollError('');
      } catch (caught) {
        if (!alive) return;
        setPollError(caught instanceof Error ? caught.message : 'Polling status gagal.');
      }
    }

    const interval = window.setInterval(refreshJob, 2200);
    void refreshJob();

    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, [job.id, isTerminal]);

  const summaryItems = useMemo(
    () => [
      { label: 'Input file', value: job.input.originalName },
      { label: 'Input size', value: formatBytes(job.input.size) },
      { label: 'Scale', value: `${job.scale}x` },
      { label: 'Mode', value: formatLabel(job.model) },
      { label: 'Created', value: formatDateTime(job.createdAt) },
      { label: 'Updated', value: formatDateTime(job.updatedAt) },
    ],
    [job],
  );

  return (
    <div className="stack-gap">
      <section className="panel stack-gap">
        <div className="result-top">
          <div>
            <p className="eyebrow">Live job snapshot</p>
            <h2 className="result-title">{job.input.originalName}</h2>
            <p className="muted-copy small-text">Polling otomatis berhenti saat job selesai atau gagal.</p>
          </div>
          <StatusBadge status={job.status} />
        </div>
        <div className="summary-grid">
          {summaryItems.map((item) => (
            <div key={item.label} className="meta-item">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
          {job.output?.engine ? (
            <div className="meta-item">
              <span>Engine</span>
              <strong>{job.output.engine}</strong>
            </div>
          ) : null}
          {job.output?.durationMs ? (
            <div className="meta-item">
              <span>Processing time</span>
              <strong>{formatDuration(job.output.durationMs)}</strong>
            </div>
          ) : null}
        </div>
        {pollError ? (
          <div className="status-callout alert-error">
            <strong>Polling bermasalah</strong>
            <p className="small-text">{pollError}</p>
          </div>
        ) : null}
      </section>

      <div className="live-grid">
        <section className="panel stack-gap">
          <div className="panel-header">
            <div>
              <h2>Preview hasil</h2>
              <p>Input image selalu tersedia. Output muncul ketika worker menandai job sebagai done.</p>
            </div>
          </div>

          {job.status === 'done' && job.urls.output ? (
            <div className="preview-card stack-gap">
              <BeforeAfterComparison beforeSrc={job.urls.input} afterSrc={job.urls.output} alt={job.input.originalName} />
              <div className="job-actions">
                <a className="button" href={job.urls.output} download>
                  Download hasil
                </a>
                <a className="button button-secondary" href={job.urls.input} download>
                  Download input
                </a>
              </div>
            </div>
          ) : job.status === 'failed' ? (
            <div className="status-callout alert-error">
              <strong>Proses gagal</strong>
              <p className="small-text">{job.error || 'Worker mengembalikan status failed tanpa pesan tambahan.'}</p>
            </div>
          ) : (
            <div className="status-callout">
              <strong>Job sedang berjalan</strong>
              <p className="small-text">
                Status saat ini: {job.status}. Worker akan memproses satu job pada satu waktu agar tetap stabil di VPS kecil.
              </p>
            </div>
          )}
        </section>

        <aside className="panel stack-gap">
          <div className="panel-header">
            <div>
              <h2>Job logs</h2>
              <p>Log ditulis ke file job JSON agar mudah direview setelah deploy.</p>
            </div>
          </div>
          {job.logs.length ? (
            <div className="log-card">
              <ul className="job-log-list">
                {job.logs.map((log, index) => (
                  <li key={`${log.at}-${index}`} className="job-log">
                    <strong>{log.message}</strong>
                    <time dateTime={log.at}>{formatDateTime(log.at)}</time>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="empty-state">Belum ada log pada job ini.</div>
          )}
        </aside>
      </div>
    </div>
  );
}
