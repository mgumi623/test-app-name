'use client';

import ClientLayout from './ClientLayout';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}