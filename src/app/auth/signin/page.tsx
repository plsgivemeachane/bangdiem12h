'use client'

import { signIn } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Lock, Mail } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/use-auth'
import {
  SIGNIN,
  PLACEHOLDERS,
  LABELS,
  MESSAGES,
  DESCRIPTIONS
} from '@/lib/translations'

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, authLoading, router])

  // Don't render the form if user is authenticated or auth is still loading
  if (authLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-gray-600">
                {authLoading ? 'Checking authentication...' : 'Redirecting to dashboard...'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

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
        toast.success(MESSAGES.SUCCESS.SIGNED_IN)
        router.push('/dashboard')
      } else {
        throw new Error(result?.error || MESSAGES.ERROR.INVALID_INPUT)
      }
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error(error instanceof Error ? error.message : MESSAGES.ERROR.SOMETHING_WENT_WRONG)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{SIGNIN.WELCOME_BACK}</CardTitle>
          <CardDescription>
            {SIGNIN.LOGIN_TO_GROUP_SYSTEM}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{LABELS.EMAIL}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder={SIGNIN.ENTER_EMAIL}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{LABELS.PASSWORD}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder={SIGNIN.ENTER_PASSWORD}
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
                SIGNIN.SIGNIN
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {SIGNIN.NO_ACCOUNT_ADMIN}
            </p>
          </div>

          <p className="text-xs text-center text-gray-600 mt-4">
            {SIGNIN.TERMS_PRIVACY_AGREEMENT}{' '}
            <Link href="/terms" className="text-primary hover:underline">
              {SIGNIN.TERMS_OF_SERVICE}
            </Link>{' '}
            {SIGNIN.AND}{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              {SIGNIN.PRIVACY_POLICY}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}