import { Role } from './role'

const PERMISSIONS = [
    'dashboard:view',
    'bookings:read',
    'bookings:edit',
    'bookings:create',
    'creations:read',
    'admin', // everything else.. could be broken down, but unneccesary for now.
] as const

export type Permission = (typeof PERMISSIONS)[number]

export const RolePermissionMap: Record<Role, Permission[]> = {
    admin: ['admin', 'dashboard:view', 'bookings:read', 'bookings:create', 'bookings:edit', 'creations:read'],
    'studio-ipad': ['dashboard:view', 'bookings:read', 'creations:read'],
    manager: ['dashboard:view', 'bookings:edit', 'bookings:read', 'creations:read'],
    facilitator: ['dashboard:view', 'bookings:read'],
}
