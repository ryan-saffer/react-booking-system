import type { Role } from './role'

const PERMISSIONS = [
    'dashboard:view',
    'bookings:read',
    'bookings:edit',
    'bookings:create',
    'after-school-programs:read',
    'creations:read',
    'admin', // everything else.. could be broken down, but unneccesary for now.
] as const

export type Permission = (typeof PERMISSIONS)[number]

export const RolePermissionMap: Record<Role, Permission[]> = {
    admin: [
        'admin',
        'dashboard:view',
        'bookings:read',
        'bookings:create',
        'bookings:edit',
        'creations:read',
        'after-school-programs:read',
    ],
    'studio-ipad': ['dashboard:view', 'bookings:read', 'creations:read', 'after-school-programs:read'],
    manager: ['dashboard:view', 'bookings:edit', 'bookings:read', 'creations:read', 'after-school-programs:read'],
    facilitator: ['dashboard:view', 'after-school-programs:read'],
}
