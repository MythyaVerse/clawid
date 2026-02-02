import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ClawID - Verification for AI Agent Skills',
  description: 'Cryptographic verification for AI agent skills. Prove integrity and provenance.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
