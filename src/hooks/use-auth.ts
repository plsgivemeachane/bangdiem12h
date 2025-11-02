'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useCallback, useMemo } from 'react'

interface User {
  id: string
  email: string | null
  name: string | null
  role: string
}

interface UseAuthReturn {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshSession: () => void
}

/**
 * Custom hook for managing authentication state
 * Provides consistent interface for auth operations across the app
 */
export function useAuth(): UseAuthReturn {
  const { data: session, status, update } = useSession()

  const user = useMemo(() => {
    if (!session?.user) return null
    
    return {
      id: session.user.id as string,
      email: session.user.email,
      name: session.user.name,
      role: (session.user.role as string) || 'USER'
    }
  }, [session])

  const isLoading = status === 'loading'
  const isAuthenticated = !!session?.user
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'OWNER'

  const handleSignIn = useCallback(async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      return result
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }, [])

  const handleSignOut = useCallback(async () => {
    try {
      await signOut({ redirect: false })
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }, [])

  const refreshSession = useCallback(() => {
    update()
  }, [update])

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    signIn: handleSignIn,
    signOut: handleSignOut,
    refreshSession
  }
}

/**
 * Hook to check if user has specific permissions
 */
export function usePermissions() {
  const { user, isAdmin } = useAuth()

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false
    
    // Admin/Owner has all permissions
    if (isAdmin) return true

    // Check specific permissions based on role
    switch (permission) {
      case 'create-group':
        return true // All authenticated users can create groups
      case 'edit-group':
        return user.role === 'OWNER' || user.role === 'ADMIN'
      case 'delete-group':
        return user.role === 'OWNER'
      case 'manage-members':
        return user.role === 'OWNER' || user.role === 'ADMIN'
      case 'create-scoring-rules':
        return user.role === 'OWNER' || user.role === 'ADMIN'
      case 'edit-scoring-rules':
        return user.role === 'OWNER' || user.role === 'ADMIN'
      case 'delete-scoring-rules':
        return user.role === 'OWNER' || user.role === 'ADMIN'
      case 'view-all-scores':
        return user.role === 'OWNER' || user.role === 'ADMIN'
      case 'record-scores':
        return true // All members can record scores
      default:
        return false
    }
  }, [user, isAdmin])

  return {
    hasPermission,
    isAdmin,
    user
  }
}

/**
 * Hook for managing loading states in auth-dependent components
 */
export function useAuthLoading() {
  const { isLoading } = useAuth()
  
  return {
    isLoading,
    isAuthenticating: isLoading
  }
}