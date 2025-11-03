'use client'

import { useState } from 'react'
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
import { AddMemberForm, GroupMember } from '@/types'
import { LoadingSpinner } from '@/components/ui/loading'
import { GroupsApi } from '@/lib/api/groups'
import toast from 'react-hot-toast'

const memberFormSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .trim(),
  role: z.enum(['MEMBER', 'ADMIN'], {
    required_error: 'Please select a role',
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

  const form = useForm<FormData>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      email: '',
      role: 'MEMBER',
    },
  })

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const newMember = await GroupsApi.addMember(groupId, data as AddMemberForm)
      toast.success('Member added successfully!')
      onSuccess(newMember)
      form.reset()
      onClose()
    } catch (error) {
      console.error('Member invite error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add member')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      form.reset()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
          <DialogDescription>
            Add a new member to this group. The user will be able to sign in with their existing account.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="user@example.com"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the email address of the user you want to add
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
                  <FormLabel>Role *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Members can record scores. Admins can also manage the group.
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
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <LoadingSpinner className="mr-2" />}
                Add Member
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
      toast.success('Member role updated successfully')
    } catch (error) {
      console.error('Failed to update member role:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update member role')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string, memberEmail: string) => {
    if (!window.confirm(`Are you sure you want to remove ${memberEmail} from this group?`)) {
      return
    }

    setIsLoading(true)
    try {
      await GroupsApi.removeMember(groupId, memberId)
      onMemberRemove?.(memberId)
      toast.success('Member removed successfully')
    } catch (error) {
      console.error('Failed to remove member:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to remove member')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Members</DialogTitle>
          <DialogDescription>
            View and manage group members. You can update roles or remove members.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No members found in this group.
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
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
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
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id, member.user?.email || 'Unknown')}
                    disabled={isLoading}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose} disabled={isLoading}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}