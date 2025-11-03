import React, { useState } from 'react'
import { X, Save, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { GroupsApi } from '@/lib/api/groups'
import { ScoringRule } from '@/types'
import toast from 'react-hot-toast'

interface RuleCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onRuleCreated?: (rule: ScoringRule) => void
  existingRule?: ScoringRule | null
  mode?: 'create' | 'edit'
}

interface RuleCriteria {
  [key: string]: any
}

export function RuleCreationModal({
  isOpen,
  onClose,
  onRuleCreated,
  existingRule,
  mode = 'create'
}: RuleCreationModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: existingRule?.name || '',
    description: existingRule?.description || '',
    points: existingRule?.points?.toString() || '',
    criteria: existingRule?.criteria || { type: 'manual', conditions: [] }
  })

  // Update form data when existing rule changes
  React.useEffect(() => {
    if (existingRule) {
      setFormData({
        name: existingRule.name || '',
        description: existingRule.description || '',
        points: existingRule.points?.toString() || '',
        criteria: existingRule.criteria || { type: 'manual', conditions: [] }
      })
    }
  }, [existingRule])

  const [criteriaType, setCriteriaType] = useState<'manual' | 'automatic'>('manual')
  const [criteriaConditions, setCriteriaConditions] = useState<RuleCriteria[]>([])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCriteriaTypeChange = (type: 'manual' | 'automatic') => {
    setCriteriaType(type)
    setFormData(prev => ({
      ...prev,
      criteria: {
        type,
        conditions: type === 'automatic' ? [] : undefined
      }
    }))
  }

  const handleAddCondition = () => {
    setCriteriaConditions(prev => [...prev, {
      field: '',
      operator: '',
      value: ''
    }])
  }

  const handleRemoveCondition = (index: number) => {
    setCriteriaConditions(prev => prev.filter((_, i) => i !== index))
  }

  const handleConditionChange = (index: number, field: string, value: string) => {
    setCriteriaConditions(prev => prev.map((condition, i) => 
      i === index ? { ...condition, [field]: value } : condition
    ))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Rule name is required')
      return false
    }

    if (!formData.points || isNaN(parseInt(formData.points))) {
      toast.error('Please enter a valid number for points (positive for rewards, negative for penalties)')
      return false
    }

    return true
  }

  const buildCriteria = () => {
    if (criteriaType === 'manual') {
      return { type: 'manual' }
    }

    // Build automatic criteria from conditions
    const conditions = criteriaConditions
      .filter(cond => cond.field && cond.operator)
      .map(cond => ({
        field: cond.field,
        operator: cond.operator,
        value: cond.value
      }))

    return {
      type: 'automatic',
      conditions
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const criteria = buildCriteria()
      const points = parseInt(formData.points)

      if (mode === 'edit' && existingRule) {
        // For now, we'll handle edit as creating a new rule
        // In a real implementation, you'd want a PUT endpoint for scoring-rules
        toast.error('Editing existing rules is not yet implemented')
        return
      }

      // Create new rule
      const newRule = await GroupsApi.createScoringRule({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        criteria,
        points
      })

      toast.success(`Rule "${newRule.name}" created successfully!`)
      onRuleCreated?.(newRule)
      onClose()
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        points: '',
        criteria: { type: 'manual', conditions: [] }
      })
      setCriteriaConditions([])

    } catch (error) {
      console.error('Failed to create rule:', error)
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to create rule')
      } else {
        toast.error('Failed to create rule')
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
        name: existingRule?.name || '',
        description: existingRule?.description || '',
        points: existingRule?.points?.toString() || '',
        criteria: existingRule?.criteria || { type: 'manual', conditions: [] }
      })
      setCriteriaConditions([])
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold">
              {mode === 'create' ? 'Create New Scoring Rule' : 'Edit Scoring Rule'}
            </CardTitle>
            <CardDescription>
              Define a new scoring rule that can be used across all groups
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
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rule-name">Rule Name *</Label>
                  <Input
                    id="rule-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Task Completion, Participation"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rule-points">Points *</Label>
                  <Input
                    id="rule-points"
                    type="number"
                    value={formData.points}
                    onChange={(e) => handleInputChange('points', e.target.value)}
                    placeholder="e.g., 10 for reward, -5 for penalty"
                    disabled={isLoading}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Use positive numbers for rewards, negative for penalties
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rule-description">Description</Label>
                <Textarea
                  id="rule-description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what this rule is for and when it should be applied..."
                  rows={3}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Scoring Criteria */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Scoring Criteria</h3>
                <Select 
                  value={criteriaType} 
                  onValueChange={handleCriteriaTypeChange}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Selection</SelectItem>
                    <SelectItem value="automatic">Automatic Conditions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={criteriaType === 'manual' ? 'default' : 'secondary'}>
                    {criteriaType === 'manual' ? 'Manual' : 'Automatic'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {criteriaType === 'manual' 
                      ? 'Members will manually select this rule when recording scores'
                      : 'Scores will be automatically calculated based on conditions'
                    }
                  </span>
                </div>

                {criteriaType === 'automatic' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Conditions</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddCondition}
                        disabled={isLoading}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Condition
                      </Button>
                    </div>

                    {criteriaConditions.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        No conditions added yet. Add conditions to automatically trigger this rule.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {criteriaConditions.map((condition, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 border rounded">
                            <Input
                              placeholder="Field"
                              value={condition.field}
                              onChange={(e) => handleConditionChange(index, 'field', e.target.value)}
                              className="flex-1"
                              disabled={isLoading}
                            />
                            <Select
                              value={condition.operator}
                              onValueChange={(value) => handleConditionChange(index, 'operator', value)}
                              disabled={isLoading}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="equals">equals</SelectItem>
                                <SelectItem value="not_equals">not equals</SelectItem>
                                <SelectItem value="greater_than">greater than</SelectItem>
                                <SelectItem value="less_than">less than</SelectItem>
                                <SelectItem value="contains">contains</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="Value"
                              value={condition.value}
                              onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                              className="flex-1"
                              disabled={isLoading}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveCondition(index)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {criteriaType === 'manual' && (
                  <p className="text-sm text-muted-foreground">
                    This rule will appear in the rule selection list when members record scores manually.
                  </p>
                )}
              </div>
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
                disabled={isLoading}
                className="min-w-32"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {mode === 'create' ? 'Create Rule' : 'Update Rule'}
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
