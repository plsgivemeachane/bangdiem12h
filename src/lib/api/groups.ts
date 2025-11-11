import { Group, CreateGroupForm, UpdateGroupForm, GroupMember, AddMemberForm } from '@/types'
import toast from 'react-hot-toast'

export class GroupsApi {
  private static baseUrl = '/api/groups'

  // Get all groups for the current user
  static async getGroups(): Promise<Group[]> {
    const response = await fetch(this.baseUrl)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Không thể tải danh sách nhóm')
    }

    const data = await response.json()
    return data.groups
  }

  // Get a specific group by ID
  static async getGroup(id: string): Promise<Group> {
    const response = await fetch(`${this.baseUrl}/${id}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Không thể tải thông tin nhóm')
    }

    const data = await response.json()
    return data.group
  }

  // Create a new group
  static async createGroup(formData: CreateGroupForm): Promise<Group> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Không thể tạo nhóm')
    }

    const data = await response.json()
    return data.group
  }

  // Update an existing group
  static async updateGroup(id: string, formData: UpdateGroupForm): Promise<Group> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Không thể cập nhật nhóm')
    }

    const data = await response.json()
    return data.group
  }

  // Delete a group
  static async deleteGroup(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Không thể xóa nhóm')
    }
  }

  // Add a member to a group (admin-managed user approach)
  static async addMember(groupId: string, formData: AddMemberForm): Promise<GroupMember> {
    const response = await fetch(`${this.baseUrl}/${groupId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Không thể thêm thành viên')
    }

    const data = await response.json()
    return data.member
  }

  // Remove a member from a group
  static async removeMember(groupId: string, memberId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${groupId}/members/${memberId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Không thể xóa thành viên')
    }
  }

  // Update member role
  static async updateMemberRole(groupId: string, memberId: string, role: string): Promise<GroupMember> {
    const response = await fetch(`${this.baseUrl}/${groupId}/members/${memberId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Không thể cập nhật vai trò thành viên')
    }

    const data = await response.json()
    return data.member
  }

  // Get members of a group
  static async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    const response = await fetch(`${this.baseUrl}/${groupId}/members`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Không thể tải danh sách thành viên')
    }

    const data = await response.json()
    return data.members
  }

  // Search users to add as members (for admin-managed approach)
  static async searchUsers(query: string): Promise<{ id: string; email: string; name: string | null }[]> {
    const response = await fetch(`${this.baseUrl}/search-users?q=${encodeURIComponent(query)}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Không thể tìm kiếm người dùng')
    }

    const data = await response.json()
    return data.users
  }

  // Score Records API
  static async getScoreRecords(groupId: string, options?: {
    userId?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }): Promise<{ scoreRecords: any[], pagination: any }> {
    const searchParams = new URLSearchParams({ groupId })
    
    if (options?.userId) searchParams.append('userId', options.userId)
    if (options?.startDate) searchParams.append('startDate', options.startDate)
    if (options?.endDate) searchParams.append('endDate', options.endDate)
    if (options?.limit) searchParams.append('limit', options.limit.toString())
    if (options?.offset) searchParams.append('offset', options.offset.toString())

    const response = await fetch(`/api/score-records?${searchParams}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Không thể tải bản ghi điểm')
    }

    return await response.json()
  }

  // Create a new score record
  static async createScoreRecord(formData: { groupId: string; ruleId: string; targetUserId: string; criteria?: any; notes?: string; points?: number; recordedAt?: Date }): Promise<any> {
    const response = await fetch('/api/score-records', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Không thể tạo bản ghi điểm')
    }

    const data = await response.json()
    return data.scoreRecord
  }

  // Update an existing score record
  static async updateScoreRecord(id: string, formData: { points?: number; notes?: string; recordedAt?: Date }): Promise<any> {
    const response = await fetch('/api/score-records', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...formData }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Không thể cập nhật bản ghi điểm')
    }

    const data = await response.json()
    return data.scoreRecord
  }

  // Global Scoring Rules API
  static async getScoringRules(groupId?: string): Promise<any[]> {
    const url = groupId ? `/api/scoring-rules?groupId=${groupId}` : '/api/scoring-rules'
    const response = await fetch(url)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Không thể tải quy tắc chấm điểm')
    }

    const data = await response.json()
    return data.scoringRules || []
  }

  // Get ALL global rules (not filtered by group)
  static async getAllGlobalRules(): Promise<any[]> {
    const response = await fetch('/api/scoring-rules')
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Không thể tải quy tắc toàn cục')
    }

    const data = await response.json()
    return data.scoringRules || []
  }

  // Create a new global scoring rule (admin only)
  static async createScoringRule(formData: { name: string; description?: string; criteria: any; points: number; autoAddToGroups?: boolean }): Promise<any> {
    const response = await fetch('/api/scoring-rules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Không thể tạo quy tắc chấm điểm')
    }

    const data = await response.json()
    
    // Show additional success message if rule was auto-added to groups
    if (data.autoAddToGroups && data.groupsAdded > 0) {
      toast.success(`Quy tắc "${data.scoringRule.name}" đã được tạo và tự động thêm vào ${data.groupsAdded} nhóm!`)
    }
    
    // Return the full response object to preserve autoAddToGroups and groupsAdded properties
    return data
  }

  // Get all groups for automatic assignment
  static async getAllGroups(): Promise<Group[]> {
    const response = await fetch('/api/groups')
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Không thể tải danh sách nhóm')
    }

    const data = await response.json()
    return data.groups || []
  }

  // Add rule to multiple groups
  static async addRuleToGroups(groupId: string, ruleId: string): Promise<any> {
    const response = await fetch(`/api/groups/${groupId}/rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ groupId, ruleId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Không thể thêm quy tắc vào nhóm')
    }

    const data = await response.json()
    return data.groupRule
  }

  // Add rule to group
  static async addRuleToGroup(groupId: string, ruleId: string): Promise<any> {
    const response = await fetch(`/api/groups/${groupId}/rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ groupId, ruleId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Không thể thêm quy tắc vào nhóm')
    }

    const data = await response.json()
    return data.groupRule
  }

  // Remove rule from group
  static async removeRuleFromGroup(groupId: string, ruleId: string): Promise<void> {
    const response = await fetch(`/api/groups/${groupId}/rules?groupId=${groupId}&ruleId=${ruleId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Không thể xóa quy tắc khỏi nhóm')
    }
  }

  // Update an existing scoring rule
  static async updateScoringRule(id: string, formData: { name: string; description?: string; criteria: any; points: number }): Promise<any> {
    const response = await fetch('/api/scoring-rules', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...formData }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Không thể cập nhật quy tắc chấm điểm')
    }

    const data = await response.json()
    return data.scoringRule
  }
  // Delete an existing scoring rule
  static async deleteScoringRule(id: string): Promise<void> {
    const response = await fetch(`/api/scoring-rules/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Không thể xóa quy tắc chấm điểm')
    }
  }
}