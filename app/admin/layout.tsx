import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin â€“ StreetDrop Wear',
  robots: 'noindex,nofollow',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#0B0B0D]">{children}</div>
}
