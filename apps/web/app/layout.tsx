import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PrintByFalcon | طابعات وأحبار',
  description: 'Your one-stop shop for printers and printing supplies in Egypt',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
