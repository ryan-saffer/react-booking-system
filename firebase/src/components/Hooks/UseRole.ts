import { Roles } from '../../constants/roles'

import { useAuth } from './context/useAuth'

const useRole = () => {
    const authUser = useAuth()
    if (authUser?.roles['ADMIN']) {
        return Roles.ADMIN
    } else if (authUser?.roles['RESTRICTED']) {
        return Roles.RESTRICTED
    } else {
        return Roles.BASIC
    }
}

export default useRole
