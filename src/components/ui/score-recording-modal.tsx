'use client'

import React, { useState } from 'react'
import { X, Save, Award, Calendar, FileText, Target, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { GroupsApi } from '@/lib/api/groups'
import { ScoringRule, GroupMember } from '@/types'
import toast from 'react-hot-toast'

interface ScoreRecordingModalProps {
  isOpen: boolean
  onClose: () => void
  onScoreRecorded?: (scoreRecord: any) => void
  groupId: string
  groupName: string
  availableRules: ScoringRule[]
  groupMembers: GroupMember[]
}

export function ScoreRecordingModal({
  isOpen,
  onClose,
  onScoreRecorded,
  groupId,
  groupName,
  availableRules,
  groupMembers
}: ScoreRecordingModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    targetUserId: '',
    ruleId: '',
    points: '',
    notes: '',
    recordedAt: new Date().toISOString().split('T')[0] // Default to today
  })

  const selectedRule = availableRules.find(rule => rule.id === formData.ruleId)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-fill points when rule is selected
    if (field === 'ruleId' && value) {
      const rule = availableRules.find(r => r.id === value)
      if (rule) {
        setFormData(prev => ({
          ...prev,
          points: rule.points.toString()
        }))
      }
    }
  }

  const validateForm = () => {
    if (!formData.targetUserId) {
      toast.error('Please select a member')
      return false
    }

    if (!formData.ruleId) {
      toast.error('Please select a scoring rule')
      return false
    }

    if (!formData.points || isNaN(parseFloat(formData.points))) {
      toast.error('Please enter valid points')
      return false
    }

    if (parseFloat(formData.points) <= 0) {
      toast.error('Points must be greater than 0')
      return false
    }

    const points = parseFloat(formData.points)
    if (selectedRule && points !== selectedRule.points) {
      // Allow custom points, but warn if different from rule's default
      if (!window.confirm(`You're recording ${points} points but the rule "${selectedRule.name}" typically gives ${selectedRule.points} points. Continue anyway?`)) {
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const scoreData = {
        groupId,
        ruleId: formData.ruleId,
        targetUserId: formData.targetUserId,
        points: parseFloat(formData.points),
        notes: formData.notes.trim() || undefined,
        recordedAt: formData.recordedAt ? new Date(formData.recordedAt) : undefined
      }

      const newScoreRecord = await GroupsApi.createScoreRecord(scoreData)
      
      toast.success(`Score of ${newScoreRecord.points} points recorded successfully!`)
      onScoreRecorded?.(newScoreRecord)
      onClose()
      
      // Reset form
      setFormData({
        targetUserId: '',
        ruleId: '',
        points: '',
        notes: '',
        recordedAt: new Date().toISOString().split('T')[0]
      })

    } catch (error) {
      console.error('Failed to record score:', error)
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to record score')
      } else {
        toast.error('Failed to record score')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
      // Reset form
      setFormData({
        targetUserId: '',
        ruleId: '',
        points: '',
        notes: '',
        recordedAt: new Date().toISOString().split('T')[0]
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Award className="h-5 w-5" />
              Record Score
            </CardTitle>
            <CardDescription>
              Add a new score record to {groupName}
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Member Selection */}
            <div className="space-y-2">
              <Label htmlFor="member-select" className="text-base font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Member *
              </Label>
              <Select 
                value={formData.targetUserId} 
                onValueChange={(value) => handleInputChange('targetUserId', value)}
                disabled={isLoading}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a member to score..." />
                </SelectTrigger>
                <SelectContent>
                  {groupMembers.map((member) => (
                    <SelectItem key={member.userId} value={member.userId}>
                      <div className="flex items-center justify-between w-full">
                        <span>{member.user?.name || member.user?.email}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {member.role.toLowerCase()}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Select which member this score is for
              </p>
            </div>

            {/* Rule Selection */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="rule-select" className="text-base font-medium">
                  Scoring Rule *
                </Label>
                <Select 
                  value={formData.ruleId} 
                  onValueChange={(value) => handleInputChange('ruleId', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a scoring rule..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRules.filter(rule => rule.isActive).map((rule) => (
                      <SelectItem key={rule.id} value={rule.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{rule.name}</span>
                          <Badge variant="outline" className="ml-2">
                            +{rule.points} pts
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableRules.filter(rule => rule.isActive).length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    No active scoring rules available. Contact an admin to add rules.
                  </p>
                )}
              </div>

              {/* Selected Rule Info */}
              {selectedRule && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{selectedRule.name}</h4>
                        {selectedRule.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedRule.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-primary">
                        <Target className="h-3 w-3 mr-1" />
                        {selectedRule.points} pts
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Points */}
            <div className="space-y-2">
              <Label htmlFor="points" className="text-base font-medium">
                Points *
              </Label>
              <div className="relative">
                <Input
                  id="points"
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.points}
                  onChange={(e) => handleInputChange('points', e.target.value)}
                  placeholder={selectedRule ? selectedRule.points.toString() : "0"}
                  disabled={isLoading}
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-sm text-muted-foreground">points</span>
                </div>
              </div>
              {selectedRule && parseFloat(formData.points) !== selectedRule.points && formData.points && (
                <p className="text-sm text-amber-600">
                  ⚠️ This differs from the rule's default of {selectedRule.points} points
                </p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="recorded-date" className="text-base font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date *
              </Label>
              <Input
                id="recorded-date"
                type="date"
                value={formData.recordedAt}
                onChange={(e) => handleInputChange('recordedAt', e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any additional context about this score..."
                rows={3}
                disabled={isLoading}
                maxLength={500}
              />
              <p className="text-sm text-muted-foreground">
                {formData.notes.length}/500 characters
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.targetUserId || !formData.ruleId || !formData.points || availableRules.filter(rule => rule.isActive).length === 0}
                className="min-w-32"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Recording...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Record Score
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
