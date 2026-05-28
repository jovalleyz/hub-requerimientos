export type RequirementStatus =
  | 'BACKLOG'
  | 'ANALYSIS'
  | 'IN_PROGRESS'
  | 'REVIEW'
  | 'COMPLETED'
  | 'CANCELLED'

export type RequirementPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export type ProductLine =
  | 'LIFE'
  | 'AUTO'
  | 'HEALTH'
  | 'HOME'
  | 'COMMERCIAL'
  | 'PLATFORM'
  | 'GENERAL'

export type UserRole = 'ADMIN' | 'MANAGER' | 'DEV' | 'VIEWER'
export type TenantPlan = 'enterprise' | 'standard'

export interface User {
  uid: string; email: string; displayName: string; photoURL?: string
  role: UserRole; tenantIds: string[]; activeTenantId: string
  jobTitle?: string; onboardingComplete?: boolean
  createdAt: string; updatedAt: string
}

export interface Invitation {
  id: string; email: string; role: UserRole; tenantId: string
  status: 'pending' | 'accepted' | 'expired'
  createdBy: string; createdAt: string; expiresAt: string
}

export interface TenantBranding {
  logoUrl?: string; primaryColor: string; secondaryColor: string; name: string
}

export interface Tenant {
  id: string; name: string; slug: string; plan: TenantPlan
  branding: TenantBranding; isActive: boolean; createdAt: string; updatedAt: string
}

export interface Requirement {
  id: string; tenantId: string; title: string; description: string
  code?: string
  status: RequirementStatus; priority: RequirementPriority; productLine: ProductLine
  assignedTo: string[]; deadline?: string; estimatedCost?: number
  linkedProjectId?: string; createdBy: string; createdAt: string; updatedAt: string
  taskCount?: number; completedTaskCount?: number
  assigneeNames?: string[]
  tags?: string[]
}

export interface RequirementTask {
  id: string; requirementId: string; tenantId: string
  title: string; completed: boolean; assignedTo?: string
  dueDate?: string; createdAt: string; updatedAt: string
}

export interface RequirementNote {
  id: string; requirementId: string; tenantId: string
  content: string; authorId: string; authorName: string
  createdAt: string; updatedAt: string
}

export interface ActivityEntry {
  id: string; requirementId?: string; tenantId: string
  action: string; actorId: string; actorName: string
  metadata?: Record<string, unknown>; createdAt: string
}

export interface Project {
  id: string; tenantId: string; name: string; description: string
  status: 'active' | 'completed' | 'on_hold' | 'cancelled'
  phases: ProjectPhase[]; totalBudget?: number; totalSpend?: number
  linkedRequirementId?: string; createdBy: string; createdAt: string; updatedAt: string
  tags?: string[]
}

export interface ProjectPhase {
  id: string; name: string; startDate: string; endDate: string
  status: 'pending' | 'active' | 'completed'; progress: number
  assignedTo?: string[]
}

export interface DashboardMetrics {
  byStatus: Record<RequirementStatus, number>
  inProgress: number; last7d: number; last30d: number
  urgent: Requirement[]; conversionRate: number
}

export interface Notification {
  id: string; type: string; title: string; message: string
  isRead: boolean; userId: string; createdAt: string
}
