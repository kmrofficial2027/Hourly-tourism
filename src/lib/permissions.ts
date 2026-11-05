// ============================================================================
// Hourly Tourism - Role-Based Access Control (RBAC)
// ============================================================================

export type AdminRole =
  | 'super_admin'
  | 'finance_admin'
  | 'support_agent'
  | 'compliance_officer'
  | 'content_moderator'
  | 'read_only_analyst'

export type AdminResource =
  | 'customers'
  | 'providers'
  | 'listings'
  | 'bookings'
  | 'payments'
  | 'refunds'
  | 'payouts'
  | 'reviews'
  | 'disputes'
  | 'safety'
  | 'settings'
  | 'reports'
  | 'audit_logs'

export type AdminAction = 'read' | 'create' | 'update' | 'delete' | 'override' | 'approve'

// Role permissions matrix
const ROLE_PERMISSIONS: Record<AdminRole, Record<AdminResource, AdminAction[]>> = {
  super_admin: {
    customers: ['read', 'create', 'update', 'delete', 'override', 'approve'],
    providers: ['read', 'create', 'update', 'delete', 'override', 'approve'],
    listings: ['read', 'create', 'update', 'delete', 'override', 'approve'],
    bookings: ['read', 'create', 'update', 'delete', 'override', 'approve'],
    payments: ['read', 'create', 'update', 'delete', 'override', 'approve'],
    refunds: ['read', 'create', 'update', 'delete', 'override', 'approve'],
    payouts: ['read', 'create', 'update', 'delete', 'override', 'approve'],
    reviews: ['read', 'create', 'update', 'delete', 'override', 'approve'],
    disputes: ['read', 'create', 'update', 'delete', 'override', 'approve'],
    safety: ['read', 'create', 'update', 'delete', 'override', 'approve'],
    settings: ['read', 'create', 'update', 'delete', 'override', 'approve'],
    reports: ['read', 'create', 'update', 'delete', 'override', 'approve'],
    audit_logs: ['read', 'create', 'update', 'delete', 'override', 'approve'],
  },
  finance_admin: {
    customers: ['read'],
    providers: ['read'],
    listings: ['read'],
    bookings: ['read'],
    payments: ['read', 'update', 'override', 'approve'],
    refunds: ['read', 'create', 'update', 'override', 'approve'],
    payouts: ['read', 'create', 'update', 'override', 'approve'],
    reviews: ['read'],
    disputes: ['read', 'update'],
    safety: ['read'],
    settings: ['read', 'update'],
    reports: ['read', 'create'],
    audit_logs: ['read'],
  },
  support_agent: {
    customers: ['read', 'update'],
    providers: ['read'],
    listings: ['read'],
    bookings: ['read', 'update'],
    payments: ['read'],
    refunds: ['read', 'create'],
    payouts: ['read'],
    reviews: ['read'],
    disputes: ['read', 'create', 'update'],
    safety: ['read', 'create', 'update'],
    settings: ['read'],
    reports: ['read'],
    audit_logs: ['read'],
  },
  compliance_officer: {
    customers: ['read', 'update', 'override'],
    providers: ['read', 'update', 'override', 'approve'],
    listings: ['read', 'update', 'approve'],
    bookings: ['read'],
    payments: ['read'],
    refunds: ['read'],
    payouts: ['read'],
    reviews: ['read', 'update', 'approve'],
    disputes: ['read', 'update', 'approve'],
    safety: ['read', 'update', 'approve'],
    settings: ['read'],
    reports: ['read'],
    audit_logs: ['read'],
  },
  content_moderator: {
    customers: ['read'],
    providers: ['read'],
    listings: ['read', 'update', 'approve'],
    bookings: ['read'],
    payments: [],
    refunds: [],
    payouts: [],
    reviews: ['read', 'update', 'delete', 'approve'],
    disputes: ['read'],
    safety: ['read'],
    settings: ['read'],
    reports: ['read'],
    audit_logs: ['read'],
  },
  read_only_analyst: {
    customers: ['read'],
    providers: ['read'],
    listings: ['read'],
    bookings: ['read'],
    payments: ['read'],
    refunds: ['read'],
    payouts: ['read'],
    reviews: ['read'],
    disputes: ['read'],
    safety: ['read'],
    settings: ['read'],
    reports: ['read'],
    audit_logs: ['read'],
  },
}

export function hasPermission(
  adminRole: AdminRole | string,
  resource: AdminResource,
  action: AdminAction
): boolean {
  const role = (adminRole in ROLE_PERMISSIONS ? adminRole : 'super_admin') as AdminRole
  const permissions = ROLE_PERMISSIONS[role]?.[resource] || []
  return permissions.includes(action)
}

