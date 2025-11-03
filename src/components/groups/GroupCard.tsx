'use client'

import { useState } from 'react'
import { 
  Users, 
  Trophy, 
  MoreVertical, 
  Edit, 
  Trash2, 
  UserPlus, 
  Activity,
  Calendar
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { GroupCardProps } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'
import { usePermissions } from '@/hooks/use-auth'
import { LoadingSpinner } from '@/components/ui/loading'

export function GroupCard({ 
  group, 
  onEdit, 
  onDelete, 
  onManageMembers, 
  onViewDetails 
}: GroupCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { hasPermission } = usePermissions()
  
  const memberCount = group.members?.length || 0
  const activeRulesCount = group._count?.groupRules || 0
  const scoreRecordsCount = group._count?.scoreRecords || 0

  const handleEdit = () => {
    if (onEdit) {
      onEdit(group)
    }
  }

  const handleDelete = async () => {
    if (onDelete && window.confirm(`Are you sure you want to delete "${group.name}"?`)) {
      setIsLoading(true)
      try {
        await onDelete(group)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleManageMembers = () => {
    if (onManageMembers) {
      onManageMembers(group)
    } else {
      router.push(`/groups/${group.id}/members`)
    }
  }

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(group)
    } else {
      router.push(`/groups/${group.id}`)
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'default'
      case 'ADMIN':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const userRole = group.members?.find(m => m.user)?.role || 'MEMBER'

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{group.name}</CardTitle>
            {group.description && (
              <CardDescription className="line-clamp-2">
                {group.description}
              </CardDescription>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={group.isActive ? "default" : "secondary"}>
              {group.isActive ? 'Active' : 'Inactive'}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {isLoading ? (
                    <LoadingSpinner className="h-4 w-4" />
                  ) : (
                    <MoreVertical className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleViewDetails}>
                  <Activity className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                
                {hasPermission('manage-members') && (
                  <DropdownMenuItem onClick={handleManageMembers}>
                    <Users className="mr-2 h-4 w-4" />
                    Manage Members
                  </DropdownMenuItem>
                )}
                
                {hasPermission('edit-group') && (
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Group
                  </DropdownMenuItem>
                )}
                
                {hasPermission('delete-group') && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleDelete}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Group
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            <span>{activeRulesCount} rule{activeRulesCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{scoreRecordsCount} record{scoreRecordsCount !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Creator Info */}
        {group.createdBy && (
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              Created by {group.createdBy.name || group.createdBy.email}
            </div>
            <Badge variant={getRoleBadgeVariant(userRole)} className="text-xs">
              {userRole.toLowerCase()}
            </Badge>
          </div>
        )}

        {/* Time Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>
              Created {formatDistanceToNow(new Date(group.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleViewDetails}
            className="flex-1"
          >
            <Activity className="mr-2 h-4 w-4" />
            Details
          </Button>
          
          {hasPermission('manage-members') && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManageMembers}
              className="flex-1"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Members
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}