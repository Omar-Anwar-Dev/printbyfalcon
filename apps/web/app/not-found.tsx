import Link from 'next/link';

export default function RootNotFound() {
  return (
    <html>
      <body>
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1a1a2e' }}>404</h1>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>Page not found</p>
          <Link href="/ar" style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', background: '#e8b86d', color: '#1a1a2e', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 'bold' }}>
            Back to home
          </Link>
        </div>
      </body>
    </html>
  );
}
