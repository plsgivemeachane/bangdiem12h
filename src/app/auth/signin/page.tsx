'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Lock, Mail } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setIsLoading(true)
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.ok) {
        toast.success('Đăng nhập thành công!')
        router.push('/dashboard')
      } else {
        throw new Error(result?.error || 'Thông tin đăng nhập không hợp lệ')
      }
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error(error instanceof Error ? error.message : 'Không thể đăng nhập')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Chào mừng trở lại</CardTitle>
          <CardDescription>
            Đăng nhập vào Hệ thống chấm điểm nhóm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Nhập mật khẩu của bạn"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading || !email || !password}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản? Liên hệ quản trị viên để tạo tài khoản.
            </p>
          </div>

          <p className="text-xs text-center text-gray-600 mt-4">
            Bằng cách đăng nhập, bạn đồng ý với{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Điều khoản dịch vụ
            </Link>{' '}
            và{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Chính sách bảo mật
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}