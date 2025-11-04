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
    .min(1, 'Tên nhóm là bắt buộc')
    .max(100, 'Tên nhóm phải ít hơn 100 ký tự')
    .trim(),
  description: z.string()
    .max(500, 'Mô tả phải ít hơn 500 ký tự')
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
        toast.success('Tạo nhóm thành công!')
        onSuccess(newGroup)
      } else {
        if (!group?.id) throw new Error('ID nhóm là bắt buộc để chỉnh sửa')
        const updatedGroup = await GroupsApi.updateGroup(group.id, data as UpdateGroupForm)
        toast.success('Cập nhật nhóm thành công!')
        onSuccess(updatedGroup)
      }
    } catch (error) {
      console.error('Lỗi biểu mẫu nhóm:', error)
      toast.error(error instanceof Error ? error.message : 'Đã xảy ra lỗi')
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
            {mode === 'create' ? 'Tạo nhóm mới' : 'Chỉnh sửa nhóm'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Tạo nhóm mới để bắt đầu tổ chức các hoạt động chấm điểm của bạn.'
              : 'Thay đổi thông tin nhóm của bạn.'
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
                  <FormLabel>Tên nhóm *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập tên nhóm"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Tên duy nhất để xác định nhóm của bạn
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
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả nhóm (tùy chọn)"
                      className="resize-none"
                      rows={3}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Mô tả tùy chọn để giúp thành viên hiểu mục đích của nhóm
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
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <LoadingSpinner className="mr-2" />}
                {mode === 'create' ? 'Tạo nhóm' : 'Cập nhật nhóm'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}