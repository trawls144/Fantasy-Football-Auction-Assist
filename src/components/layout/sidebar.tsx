'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Users,
  Target,
  TrendingUp,
  DollarSign,
  Search,
  Settings,
  BarChart3,
  Home
} from 'lucide-react'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const navigation = [
    {
      name: 'Dashboard',
      href: '#',
      icon: Home,
      current: true
    },
    {
      name: 'Player Search',
      href: '#player-search',
      icon: Search,
      current: false
    },
    {
      name: 'My Roster',
      href: '#roster',
      icon: Users,
      current: false
    },
    {
      name: 'Target Players',
      href: '#targets',
      icon: Target,
      current: false
    },
    {
      name: 'Budget Tracker',
      href: '#budget',
      icon: DollarSign,
      current: false
    },
    {
      name: 'Scenarios',
      href: '#scenarios',
      icon: TrendingUp,
      current: false
    },
    {
      name: 'Analytics',
      href: '#analytics',
      icon: BarChart3,
      current: false
    }
  ]

  return (
    <div className={cn('pb-12 min-h-screen', className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center space-x-2 px-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BarChart3 className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight">
              Auctioneer
            </h2>
          </div>
          <div className="mt-8 space-y-1">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant={item.current ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                asChild
              >
                <a href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </a>
              </Button>
            ))}
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Quick Actions
          </h2>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-auto p-4">
        <div className="flex items-center space-x-2 rounded-lg border p-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>FF</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">Fantasy Manager</p>
            <p className="text-xs leading-none text-muted-foreground">
              Draft in progress
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}