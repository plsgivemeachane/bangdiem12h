import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { verifyPassword } from '@/lib/utils/password'
import { logUserLogin, logLoginFailed } from '@/lib/activity-logger'
import { prisma } from '@/lib/prisma'

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      role: string
    }
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
            }
          })

          if (!user) {
            await logLoginFailed(credentials.email, 'user_not_found')
            return null
          }

          // Check if user has a password (OAuth users won't have passwords)
          if (!user.password) {
            await logLoginFailed(credentials.email, 'oauth_user_no_password')
            return null
          }

          // Verify password
          const isValidPassword = await verifyPassword(credentials.password, user.password)
          
          if (!isValidPassword) {
            await logLoginFailed(credentials.email, 'invalid_password')
            return null
          }

          // Log successful login
          await logUserLogin(user.id, {
            email: user.email,
            method: 'password',
          })

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          await logLoginFailed(credentials.email, 'system_error')
          return null
        }
      }
    })
  ],
  callbacks: {
    async session({ session, user, token }) {
      if (session?.user && token?.sub) {
        session.user.id = token.sub
        session.user.role = (token as any).role || 'USER'
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.role = (user as any).role || 'USER'
      }
      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  events: {
    async createUser({ user }) {
      // Log user registration
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'USER_REGISTERED',
          description: `User ${user.email} registered`,
          metadata: { email: user.email },
        },
      })
    },
  },
}