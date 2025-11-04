'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { AddMemberForm, GroupMember } from '@/types'

// User search result type from the API
interface SearchUserResult {
  id: string
  email: string
  name: string | null
  role?: string
  createdAt?: Date
}
import { LoadingSpinner } from '@/components/ui/loading'
import { GroupsApi } from '@/lib/api/groups'
import { useDebounce } from '@/hooks/use-debounce'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const memberFormSchema = z.object({
  email: z.string()
    .min(1, 'Vui lòng nhập email')
    .email('Vui lòng nhập địa chỉ email hợp lệ')
    .trim(),
  role: z.enum(['MEMBER', 'ADMIN'], {
    required_error: 'Vui lòng chọn vai trò',
  }),
})

type FormData = z.infer<typeof memberFormSchema>

interface MemberInviteProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (member?: GroupMember) => void
  groupId: string
}

export function MemberInvite({ isOpen, onClose, onSuccess, groupId }: MemberInviteProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<SearchUserResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState<SearchUserResult | null>(null)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const form = useForm<FormData>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      email: '',
      role: 'MEMBER',
    },
  })

  // Load initial users when dropdown opens
  useEffect(() => {
    const loadInitialUsers = async () => {
      if (open && users.length === 0 && searchQuery.length === 0) {
        setIsSearching(true)
        try {
          // Fetch all users (no query) to get initial list
          const results = await GroupsApi.searchUsers('')
          setUsers(results)
        } catch (error) {
          console.error('Không thể tải danh sách người dùng ban đầu:', error)
          // Don't show error toast for initial load
        } finally {
          setIsSearching(false)
        }
      }
    }

    loadInitialUsers()
  }, [open, users.length, searchQuery.length])

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      // If empty or just spaces, don't search (keep initial list)
      if (debouncedSearchQuery.trim().length === 0) {
        return
      }

      // Only search if user typed at least 1 character
      if (debouncedSearchQuery.length < 1) {
        return
      }

      setIsSearching(true)
      try {
        const results = await GroupsApi.searchUsers(debouncedSearchQuery)
        setUsers(results)
      } catch (error) {
        console.error('Không thể tìm kiếm người dùng:', error)
        toast.error('Không thể tìm kiếm người dùng')
        setUsers([])
      } finally {
        setIsSearching(false)
      }
    }

    performSearch()
  }, [debouncedSearchQuery])

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const newMember = await GroupsApi.addMember(groupId, data as AddMemberForm)
      toast.success('Thêm thành viên thành công!')
      onSuccess(newMember)
      form.reset()
      onClose()
    } catch (error) {
      console.error('Lỗi thêm thành viên:', error)
      toast.error(error instanceof Error ? error.message : 'Không thể thêm thành viên')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      form.reset()
      setSelectedUser(null)
      setSearchQuery('')
      setUsers([])
      setOpen(false)
      onClose()
    }
  }

  const handleSelectUser = (user: SearchUserResult) => {
    setSelectedUser(user)
    form.setValue('email', user.email)
    setOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm thành viên</DialogTitle>
          <DialogDescription>
            Thêm thành viên mới vào nhóm. Người dùng có thể đăng nhập bằng tài khoản hiện có.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Địa chỉ email *</FormLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className={cn(
                            "w-full justify-between",
                            !selectedUser && "text-muted-foreground"
                          )}
                          disabled={isLoading}
                        >
                          {selectedUser ? (
                            <div className="flex flex-col items-start text-left">
                              <span className="font-medium">{selectedUser.name || selectedUser.email}</span>
                              {selectedUser.name && (
                                <span className="text-xs text-muted-foreground">{selectedUser.email}</span>
                              )}
                            </div>
                          ) : (
                            "Tìm kiếm người dùng..."
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Tìm theo tên hoặc email..."
                          value={searchQuery}
                          onValueChange={setSearchQuery}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {isSearching ? (
                              <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span className="text-sm text-muted-foreground">
                                  {searchQuery.length === 0 ? 'Đang tải danh sách người dùng...' : 'Đang tìm kiếm...'}
                                </span>
                              </div>
                            ) : (
                              <div className="py-6 text-center text-sm text-muted-foreground">
                                    Không tìm thấy người dùng nào
                              </div>
                            )}
                          </CommandEmpty>
                          {users.length > 0 && (
                            <CommandGroup heading={searchQuery.trim().length > 0 ? "Kết quả tìm kiếm" : "Tất cả người dùng hiện có"}>
                              {users.map((user) => (
                                <CommandItem
                                  key={user.id}
                                  value={user.email}
                                  onSelect={() => handleSelectUser(user)}
                                  className="cursor-pointer"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedUser?.id === user.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span className="font-medium">{user.name || user.email}</span>
                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Tìm và chọn người dùng trong hệ thống
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vai trò *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MEMBER">Thành viên</SelectItem>
                      <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Thành viên có thể ghi điểm. Quản trị viên còn có thể quản lý nhóm.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isLoading}
              >
                Huỷ
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <LoadingSpinner className="mr-2" />}
                Thêm thành viên
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// Member management component for viewing and managing existing members
interface MemberManagementProps {
  isOpen: boolean
  onClose: () => void
  groupId: string
  members: GroupMember[]
  onMemberUpdate?: (member: GroupMember) => void
  onMemberRemove?: (memberId: string) => void
}

export function MemberManagement({ 
  isOpen, 
  onClose, 
  groupId, 
  members, 
  onMemberUpdate,
  onMemberRemove 
}: MemberManagementProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleRoleChange = async (memberId: string, newRole: 'MEMBER' | 'ADMIN') => {
    setIsLoading(true)
    try {
      const updatedMember = await GroupsApi.updateMemberRole(groupId, memberId, newRole)
      onMemberUpdate?.(updatedMember)
      toast.success('Cập nhật vai trò thành viên thành công')
    } catch (error) {
      console.error('Không thể cập nhật vai trò thành viên:', error)
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật vai trò thành viên')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string, memberEmail: string) => {
    if (!window.confirm(`Bạn có chắc muốn xoá ${memberEmail} khỏi nhóm này không?`)) {
      return
    }

    setIsLoading(true)
    try {
      await GroupsApi.removeMember(groupId, memberId)
      onMemberRemove?.(memberId)
      toast.success('Xoá thành viên thành công')
    } catch (error) {
      console.error('Không thể xoá thành viên:', error)
      toast.error(error instanceof Error ? error.message : 'Không thể xoá thành viên')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Quản lý thành viên</DialogTitle>
          <DialogDescription>
            Xem và quản lý thành viên trong nhóm. Bạn có thể cập nhật vai trò hoặc xoá thành viên.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Không có thành viên nào trong nhóm này.
            </div>
          ) : (
            members.map((member) => (
              <div 
                key={member.id} 
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="font-medium">{member.user?.name || member.user?.email}</div>
                  <div className="text-sm text-muted-foreground">{member.user?.email}</div>
                  <div className="text-xs text-muted-foreground">
                    Tham gia ngày {new Date(member.joinedAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select
                    value={member.role}
                    onValueChange={(value: 'MEMBER' | 'ADMIN') => handleRoleChange(member.id, value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">Thành viên</SelectItem>
                      <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id, member.user?.email || 'Không xác định')}
                    disabled={isLoading}
                  >
                    Xoá
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose} disabled={isLoading}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}