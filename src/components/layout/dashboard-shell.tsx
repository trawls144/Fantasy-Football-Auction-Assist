'use client'

import { cn } from '@/lib/utils'
import { Header } from './header'

interface DashboardShellProps {
  children: React.ReactNode
  className?: string
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <div className="min-h-screen w-full">
      <div className="flex flex-col">
        <Header />
        <main className={cn('flex-1 overflow-y-auto p-4 lg:p-6', className)}>
          {children}
        </main>
      </div>
    </div>
  )
}