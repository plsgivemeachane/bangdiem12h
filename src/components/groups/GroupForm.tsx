'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { CreateGroupForm, UpdateGroupForm } from '@/types'
import { LoadingSpinner } from '@/components/ui/loading'
import { GroupsApi } from '@/lib/api/groups'
import toast from 'react-hot-toast'

const groupFormSchema = z.object({
  name: z.string()
    .min(1, 'Group name is required')
    .max(100, 'Group name must be less than 100 characters')
    .trim(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .trim()
    .optional(),
})

type FormData = z.infer<typeof groupFormSchema>

interface GroupFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (group?: any) => void
  group?: any // For editing
  mode: 'create' | 'edit'
}

export function GroupForm({ isOpen, onClose, onSuccess, group, mode }: GroupFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: group?.name || '',
      description: group?.description || '',
    },
  })

  // Reset form when group changes or dialog opens
  useEffect(() => {
    if (isOpen && group) {
      form.reset({
        name: group.name || '',
        description: group.description || '',
      })
    } else if (isOpen && !group) {
      form.reset({
        name: '',
        description: '',
      })
    }
  }, [isOpen, group, form])

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      if (mode === 'create') {
        const newGroup = await GroupsApi.createGroup(data as CreateGroupForm)
        toast.success('Group created successfully!')
        onSuccess(newGroup)
      } else {
        if (!group?.id) throw new Error('Group ID is required for editing')
        const updatedGroup = await GroupsApi.updateGroup(group.id, data as UpdateGroupForm)
        toast.success('Group updated successfully!')
        onSuccess(updatedGroup)
      }
    } catch (error) {
      console.error('Group form error:', error)
      toast.error(error instanceof Error ? error.message : 'An error occurred')
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
          <DialogTitle>
            {mode === 'create' ? 'Create New Group' : 'Edit Group'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Create a new group to start organizing your scoring activities.'
              : 'Make changes to your group information.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter group name"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    A unique name to identify your group
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter group description (optional)"
                      className="resize-none"
                      rows={3}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description to help members understand the group's purpose
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
                {mode === 'create' ? 'Create Group' : 'Update Group'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}