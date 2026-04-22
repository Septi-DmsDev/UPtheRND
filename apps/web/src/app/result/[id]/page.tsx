import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JobLiveView } from '@/components/job-live-view';
import { readJob, toPublicJob } from '@/lib/jobs';

export const dynamic = 'force-dynamic';

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await readJob(id);

  if (!job) {
    notFound();
  }

  return (
    <main className="page-shell stack-gap">
      <div className="toolbar-row">
        <div>
          <p className="eyebrow">Result detail</p>
          <h1 className="page-title">Job {job.id}</h1>
        </div>
        <Link href="/" className="button button-ghost">
          Kembali ke dashboard
        </Link>
      </div>
      <JobLiveView initialJob={toPublicJob(job)} />
    </main>
  );
}
