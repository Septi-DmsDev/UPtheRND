import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="page-shell">
      <section className="panel stack-gap centered-panel">
        <p className="eyebrow">404</p>
        <h1 className="page-title">Job tidak ditemukan</h1>
        <p className="muted-copy">Pastikan ID job benar atau job JSON masih tersedia di shared storage.</p>
        <Link href="/" className="button button-secondary">
          Kembali ke dashboard
        </Link>
      </section>
    </main>
  );
}
