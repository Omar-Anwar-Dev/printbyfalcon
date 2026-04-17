import { redirect } from 'next/navigation';

// Root path redirects to default locale
export default function RootPage() {
  redirect('/ar');
}
