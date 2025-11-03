'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { UserAccountMenu } from './UserAccountMenu'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Users, TrendingUp, Menu, X, Shield } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Bảng điều khiển', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Nhóm', href: '/groups', icon: Users },
  { name: 'Phân tích', href: '/analytics', icon: TrendingUp },
]

const adminNavigation = [
  { name: 'Quản trị', href: '/admin/users', icon: Shield },
]

export function AppHeader() {
  const pathname = usePathname()
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Don't show header on auth pages
  if (pathname?.startsWith('/auth/')) {
    return null
  }

  // Don't show if not authenticated (except loading state)
  if (!isLoading && !isAuthenticated) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo and Brand */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-lg">
              GS
            </div>
            <span className="hidden font-semibold text-lg sm:inline-block">
              Chấm Điểm Nhóm
            </span>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex md:gap-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
              {isAdmin && adminNavigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Right side - Account Menu and Mobile Toggle */}
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <>
              {/* Desktop Account Menu */}
              <div className="hidden md:block">
                <UserAccountMenu />
              </div>

              {/* Mobile menu button */}
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Mở menu chính</span>
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
            {isAdmin && adminNavigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>
          <div className="border-t px-4 py-3">
            <UserAccountMenu />
          </div>
        </div>
      )}
    </header>
  )
}
