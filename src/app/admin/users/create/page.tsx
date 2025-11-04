'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ArrowLeft, Copy, Eye, EyeOff, KeyRound, Check } from 'lucide-react'
import toast from 'react-hot-toast'

// Simple password strength checker
const checkPasswordStrength = (password: string) => {
  let strength = 0
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  }
  
  Object.values(checks).forEach(passed => {
    if (passed) strength++
  })

  return { strength, checks }
}

// Generate secure password
const generateSecurePassword = (length: number = 16): string => {
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz'
  const numberChars = '0123456789'
  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  const requiredChars = [
    uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)],
    lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)],
    numberChars[Math.floor(Math.random() * numberChars.length)],
    specialChars[Math.floor(Math.random() * specialChars.length)]
  ]

  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars
  const remainingLength = length - requiredChars.length
  const remainingChars = Array.from(
    { length: remainingLength },
    () => allChars[Math.floor(Math.random() * allChars.length)]
  )

  const allPasswordChars = [...requiredChars, ...remainingChars]
  
  // Shuffle
  for (let i = allPasswordChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allPasswordChars[i], allPasswordChars[j]] = [allPasswordChars[j], allPasswordChars[i]]
  }

  return allPasswordChars.join('')
}

export default function CreateUserPage() {
  const router = useRouter()
  const { isAdmin, isLoading: authLoading } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    role: 'USER'
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordCopied, setPasswordCopied] = useState(false)

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard')
      toast.error('Access denied. Admin privileges required.')
    }
  }, [isAdmin, authLoading, router])

  const handleGeneratePassword = () => {
    const password = generateSecurePassword(16)
    setFormData(prev => ({
      ...prev,
      password,
      confirmPassword: password
    }))
    toast.success('Secure password generated!')
  }

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(formData.password)
      setPasswordCopied(true)
      toast.success('Password copied to clipboard!')
      setTimeout(() => setPasswordCopied(false), 3000)
    } catch (error) {
      toast.error('Failed to copy password')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.email || !formData.password) {
      toast.error('Email và mật khẩu là bắt buộc')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu không khớp')
      return
    }

    const { strength } = checkPasswordStrength(formData.password)
    if (strength < 5) {
      toast.error('Mật khẩu không đáp ứng đủ yêu cầu')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name || null,
          password: formData.password,
          role: formData.role
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Không thể tạo người dùng')
      }

      const data = await response.json()
      toast.success(`Người dùng ${data.user.email} đã được tạo thành công!`)
      
      // Navigate back to users list after a brief delay
      setTimeout(() => {
        router.push('/admin/users')
      }, 1500)
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error(error instanceof Error ? error.message : 'Không thể tạo người dùng')
    } finally {
      setIsSubmitting(false)
    }
  }

  const passwordStrength = checkPasswordStrength(formData.password)
  const strengthLabel = ['Rất yếu', 'Yếu', 'Trung bình', 'Tốt', 'Mạnh'][passwordStrength.strength - 1] || 'Rất yếu'
  const strengthColor = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'][passwordStrength.strength - 1] || 'bg-gray-300'

  if (authLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/users')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách người dùng
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Quay lại quản lý người dùng</p>
          </TooltipContent>
        </Tooltip>
        <h1 className="text-3xl font-bold">Tạo người dùng mới</h1>
        <p className="text-gray-600 mt-1">Thêm người dùng mới vào hệ thống</p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin người dùng</CardTitle>
          <CardDescription>
            Điền thông tin chi tiết để tạo tài khoản người dùng mới
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="nguoi-dung@vi-du.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Họ tên</Label>
              <Input
                id="name"
                type="text"
                placeholder="Nguyễn Văn A"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">Vai trò *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Người dùng</SelectItem>
                  <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {formData.role === 'ADMIN' 
                  ? 'Quản trị viên có thể quản lý người dùng, nhóm và cài đặt hệ thống'
                  : 'Người dùng có thể tạo và quản lý nhóm cũng như hệ thống chấm điểm'
                }
              </p>
            </div>

            {/* Password Generation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Password *</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGeneratePassword}
                    >
                      <KeyRound className="mr-2 h-3 w-3" />
                      Tạo mật khẩu bảo mật
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tạo mật khẩu ngẫu nhiên mạnh</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
                <div className="absolute right-0 top-0 h-full flex items-center gap-1 pr-1">
                  {formData.password && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyPassword}
                          className="h-8 px-2"
                        >
                          {passwordCopied ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{passwordCopied ? 'Đã sao chép!' : 'Sao chép mật khẩu vào clipboard'}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="h-8 px-2"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Độ mạnh mật khẩu:</span>
                    <span className={`font-medium ${passwordStrength.strength >= 4 ? 'text-green-600' : 'text-orange-600'}`}>
                      {strengthLabel}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${level <= passwordStrength.strength ? strengthColor : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>

                  {/* Requirements Checklist */}
                  <div className="space-y-1 text-xs">
                    <div className={passwordStrength.checks.length ? 'text-green-600' : 'text-gray-500'}>
                      {passwordStrength.checks.length ? '✓' : '○'} Ít nhất 8 ký tự
                    </div>
                    <div className={passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-500'}>
                      {passwordStrength.checks.uppercase ? '✓' : '○'} Một chữ cái viết hoa
                    </div>
                    <div className={passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-500'}>
                      {passwordStrength.checks.lowercase ? '✓' : '○'} Một chữ cái viết thường
                    </div>
                    <div className={passwordStrength.checks.number ? 'text-green-600' : 'text-gray-500'}>
                      {passwordStrength.checks.number ? '✓' : '○'} Một chữ số
                    </div>
                    <div className={passwordStrength.checks.special ? 'text-green-600' : 'text-gray-500'}>
                      {passwordStrength.checks.special ? '✓' : '○'} Một ký tự đặc biệt
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Xác nhận mật khẩu"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-0 top-0 h-full px-3"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-500">Mật khẩu không khớp</p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="text-xs text-green-600">✓ Mật khẩu khớp</p>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/admin/users')}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Hủy và quay lại danh sách người dùng</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="submit"
                    disabled={isSubmitting || passwordStrength.strength < 5 || formData.password !== formData.confirmPassword}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Đang tạo...' : 'Tạo người dùng'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {isSubmitting
                      ? 'Đang tạo tài khoản người dùng...'
                      : passwordStrength.strength < 5
                        ? 'Mật khẩu không đáp ứng đủ yêu cầu'
                        : formData.password !== formData.confirmPassword
                          ? 'Mật khẩu phải khớp'
                          : 'Tạo tài khoản người dùng'
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
