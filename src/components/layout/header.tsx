'use client'

import { cn } from '@/lib/utils'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn('border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60', className)}>
      <div className="flex h-14 items-center justify-center px-4 lg:px-6">
        <h1 className="text-xl font-bold text-foreground">
          Fantasy Football Auction Assist
        </h1>
      </div>
    </header>
  )
}