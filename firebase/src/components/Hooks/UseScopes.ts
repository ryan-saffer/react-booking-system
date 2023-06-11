import { Scope } from '../../constants/scopes'
import { useAuth } from './context/useAuth'

type Permission = 'read' | 'write' | 'restricted' | 'none'

export function useScopes(): { [key in Scope]: Permission } {
    const authUser = useAuth()

    const role = authUser?.role

    if (!role) {
        return { [Scope.CORE]: 'none', [Scope.PAYROLL]: 'none' }
    }

    switch (role) {
        case 'ADMIN':
            return { [Scope.CORE]: 'write', [Scope.PAYROLL]: 'write' }
        case 'BASIC':
            return { [Scope.CORE]: 'read', [Scope.PAYROLL]: 'none' }
        case 'BOOKKEEPER':
            return { [Scope.CORE]: 'none', [Scope.PAYROLL]: 'write' }
        case 'RESTRICTED':
            return { [Scope.CORE]: 'restricted', [Scope.PAYROLL]: 'none' }
    }
}
