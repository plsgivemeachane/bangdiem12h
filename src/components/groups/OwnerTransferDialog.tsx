'use client'

import { useState } from 'react'
import { 
  AlertTriangle,
  Crown,
  Loader2
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { GroupMember } from '@/types'
import toast from 'react-hot-toast'

interface OwnerTransferDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newOwner: GroupMember) => void
  groupId: string
  groupName: string
  members: GroupMember[]
  currentUserId: string
}

export function OwnerTransferDialog({
  isOpen,
  onClose,
  onSuccess,
  groupId,
  groupName,
  members,
  currentUserId
}: OwnerTransferDialogProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('')
  const [confirmChecked, setConfirmChecked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Filter out current owner from the list
  const eligibleMembers = members.filter(
    member => member.userId !== currentUserId && member.role !== 'OWNER'
  )

  const selectedMember = members.find(m => m.id === selectedMemberId)

  const handleTransfer = async () => {
    if (!selectedMemberId || !confirmChecked) {
      toast.error('Please select a member and confirm the transfer')
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId: selectedMemberId,
          role: 'OWNER'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to transfer ownership')
      }

      const data = await response.json()
      
      toast.success(`Ownership transferred to ${selectedMember?.user?.name || 'new owner'}`)
      onSuccess(data.member)
      handleClose()
    } catch (error) {
      console.error('Error transferring ownership:', error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Failed to transfer ownership')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedMemberId('')
    setConfirmChecked(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            Transfer Group Ownership
          </DialogTitle>
          <DialogDescription>
            Transfer ownership of "{groupName}" to another member
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning Alert */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>This action is permanent</AlertTitle>
            <AlertDescription>
              Once you transfer ownership, you will become an admin and will not be able to undo this action.
              The new owner will have full control over the group.
            </AlertDescription>
          </Alert>

          {/* Member Selection */}
          <div className="space-y-2">
            <Label htmlFor="member-select">Select New Owner</Label>
            {eligibleMembers.length > 0 ? (
              <Select
                value={selectedMemberId}
                onValueChange={setSelectedMemberId}
              >
                <SelectTrigger id="member-select">
                  <SelectValue placeholder="Choose a member..." />
                </SelectTrigger>
                <SelectContent>
                  {eligibleMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <span>{member.user?.name || 'Unknown User'}</span>
                        <span className="text-xs text-muted-foreground">
                          ({member.user?.email})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">
                No eligible members found. Add more members to transfer ownership.
              </p>
            )}
          </div>

          {/* Transfer Summary */}
          {selectedMember && (
            <div className="rounded-lg border p-4 space-y-2">
              <h4 className="font-medium text-sm">Transfer Summary</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New Owner:</span>
                  <span className="font-medium">{selectedMember.user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{selectedMember.user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your New Role:</span>
                  <span className="font-medium">Admin</span>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Checkbox */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="confirm"
              checked={confirmChecked}
              onCheckedChange={(checked) => setConfirmChecked(checked as boolean)}
              disabled={!selectedMemberId}
            />
            <Label
              htmlFor="confirm"
              className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I understand that this action is permanent and I will become an admin after the transfer
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleTransfer}
            disabled={!selectedMemberId || !confirmChecked || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Transfer Ownership
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
