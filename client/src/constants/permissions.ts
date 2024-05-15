import { Permission, Role, RolePermissionMap } from 'fizz-kidz'

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
