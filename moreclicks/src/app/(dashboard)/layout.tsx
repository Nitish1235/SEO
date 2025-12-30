import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 lg:ml-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pt-16 lg:pt-6">{children}</main>
      </div>
    </div>
  )
}

