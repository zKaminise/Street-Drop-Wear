import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/layout/CartDrawer'
import { SearchModal } from '@/components/layout/SearchModal'
import { AnnouncementBar } from '@/components/layout/AnnouncementBar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main
        className="min-h-screen"
        id="main-content"
        style={{
          paddingTop: 'calc(72px + var(--announcement-bar-h, 0px))',
          transition: 'padding-top 0.3s ease',
        }}
      >
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <SearchModal />
    </>
  )
}
