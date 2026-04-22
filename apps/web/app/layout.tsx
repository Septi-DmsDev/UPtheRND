import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'UPtheRND',
  description: 'CPU friendly image enhancement starter built with Next.js and a Python worker.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <div className="app-shell">
          <header className="site-header">
            <Link href="/" className="brand-block">
              <span className="brand-mark">UP</span>
              <div>
                <strong>UPtheRND</strong>
                <span className="brand-copy">Image enhancement pipeline for Coolify</span>
              </div>
            </Link>
            <nav className="site-nav">
              <Link href="/" className="nav-link">
                Dashboard
              </Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
