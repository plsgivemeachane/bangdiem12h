'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, Settings, Activity, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'

export function UserAccountMenu() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Đăng xuất thành công')
      router.push('/auth/signin')
    } catch (error) {
      console.error('Lỗi đăng xuất:', error)
      toast.error('Không thể đăng xuất')
    }
  }

  const getInitials = (name: string | null, email: string | null): string => {
    if (name) {
      const parts = name.trim().split(' ')
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      }
      return name.substring(0, 2).toUpperCase()
    }
    if (email) {
      return email.substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  if (!user) {
    return null
  }

  const initials = getInitials(user.name, user.email)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          <Avatar className="h-10 w-10 cursor-pointer">
            <AvatarImage src={user.image || undefined} alt={user.name || 'Người dùng'} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name || 'Người dùng'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/account')} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Hồ sơ</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/account/settings')} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Cài đặt</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/activity-logs')} className="cursor-pointer">
            <Activity className="mr-2 h-4 w-4" />
            <span>Nhật ký hoạt động</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
