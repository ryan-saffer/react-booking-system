import { Role } from './roles'

const PERMISSIONS = [
    'dashboard:view',
    'bookings:read',
    'bookings:edit',
    'bookings:create',
    'creations:read',
    'admin', // everything else.. could be broken down, but unneccesary for now.
] as const

export type Permission = (typeof PERMISSIONS)[number]

const RolePermissionMap: Record<Role, Permission[]> = {
    admin: ['admin', 'dashboard:view', 'bookings:read', 'bookings:create', 'bookings:edit', 'creations:read'],
    'studio-ipad': ['dashboard:view', 'bookings:read', 'creations:read'],
    manager: ['dashboard:view', 'bookings:edit', 'bookings:read', 'creations:read'],
    facilitator: ['dashboard:view', 'bookings:read'],
}

export function checkRoleForPermission(role: Role | null, permission: Permission) {
    if (!role) {
        return false
    }
    switch (role) {
        case 'admin':
            return RolePermissionMap.admin.includes(permission)
        case 'studio-ipad':
            return RolePermissionMap['studio-ipad'].includes(permission)
        case 'manager':
            return RolePermissionMap.manager.includes(permission)
        case 'facilitator':
            return RolePermissionMap.facilitator.includes(permission)
        default: {
            const exhaustiveCheck: never = role
            localStorage.removeItem('authUser') // helps clear bug when updating a users role
            throw new Error(`unrecognised role: '${exhaustiveCheck}'`)
        }
    }
}
