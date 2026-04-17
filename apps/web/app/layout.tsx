import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PrintByFalcon — مستلزمات الطباعة',
  description: 'مستلزمات الطباعة الاحترافية بأفضل الأسعار في مصر',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
