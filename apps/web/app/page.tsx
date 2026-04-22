import { RecentJobs } from '@/components/recent-jobs';
import { UploadPanel } from '@/components/upload-panel';
import { ensureStorageDirectories } from '@/lib/paths';
import { listJobs, toPublicJob } from '@/lib/jobs';
import { appConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  await ensureStorageDirectories();
  const jobs = (await listJobs(6)).map(toPublicJob);

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="hero-grid">
          <div>
            <p className="eyebrow">Zero-budget friendly · CPU first · Coolify ready</p>
            <h1 className="hero-title">Enhance gambar blur ringan tanpa mengorbankan stabilitas VPS kecil.</h1>
            <p className="hero-copy">
              Landing page ini memakai server component untuk recent jobs, lalu menyerahkan mutasi upload ke route handler.
              Hasilnya lebih ringan, lebih mudah ditrace, dan tidak perlu fetch ulang saat render awal.
            </p>
          </div>
          <div className="stat-row">
            <article className="stat-card">
              <span>Default scale</span>
              <strong>{appConfig.defaultScale}x</strong>
            </article>
            <article className="stat-card">
              <span>Upload limit</span>
              <strong>{appConfig.maxUploadMb} MB</strong>
            </article>
            <article className="stat-card">
              <span>Queue mode</span>
              <strong>Single worker</strong>
            </article>
          </div>
        </div>
      </section>

      <div className="home-grid">
        <section className="panel stack-gap">
          <div className="panel-header">
            <div>
              <h2>Upload & create job</h2>
              <p>File akan langsung disimpan ke shared volume lalu worker memprosesnya di background.</p>
            </div>
          </div>
          <UploadPanel />
        </section>

        <aside className="panel stack-gap">
          <div className="panel-header">
            <div>
              <h2>Arsitektur render</h2>
              <p>Bagian yang perlu interaksi dipisah, sisanya tetap server rendered.</p>
            </div>
          </div>
          <ul className="feature-list">
            <li>Halaman utama membaca recent jobs langsung dari filesystem server-side.</li>
            <li>Halaman hasil merender snapshot job tanpa roundtrip API tambahan.</li>
            <li>Polling client hanya aktif saat status belum final.</li>
            <li>Worker dan web berbagi storage yang sama agar alur upload lebih sederhana.</li>
          </ul>
        </aside>
      </div>

      <section className="panel stack-gap">
        <div className="panel-header">
          <div>
            <h2>Recent jobs</h2>
            <p>Data ini dirender di server agar halaman langsung punya konteks saat dibuka.</p>
          </div>
        </div>
        <RecentJobs jobs={jobs} />
      </section>
    </main>
  );
}
