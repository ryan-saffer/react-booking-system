import { Role } from '../../constants/roles'
import { Scope } from '../../constants/scopes'
import { useAuth } from './context/useAuth'

type Permission = 'read' | 'write' | 'restricted' | 'none'

export function useScopes(): { [key in Scope]: Permission } {
    const authUser = useAuth()

    const role = authUser?.role ?? Role.NONE

    switch (role) {
        case Role.ADMIN:
            return { [Scope.CORE]: 'write', [Scope.PAYROLL]: 'write' }
        case Role.BASIC:
            return { [Scope.CORE]: 'read', [Scope.PAYROLL]: 'none' }
        case Role.BOOKKEEPER:
            return { [Scope.CORE]: 'none', [Scope.PAYROLL]: 'write' }
        case Role.RESTRICTED:
            return { [Scope.CORE]: 'restricted', [Scope.PAYROLL]: 'none' }
        case Role.NONE:
            return { [Scope.CORE]: 'none', [Scope.PAYROLL]: 'none' }
    }
}
