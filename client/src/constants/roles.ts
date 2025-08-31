import type { Role } from 'fizz-kidz'

export function getRoleDisplayValue(role: Role) {
    switch (role) {
        case 'admin':
            return 'Admin'
        case 'studio-ipad':
            return 'Studio iPad'
        case 'manager':
            return 'Manager'
        case 'facilitator':
            return 'Facilitator'
        default: {
            const exhaustiveCheck: never = role
            localStorage.removeItem('authUser') // helps recover from a stuck state
            throw new Error(`unregonised role: '${exhaustiveCheck}'`)
        }
    }
}
