import { useContext } from 'react'

import AuthUserContext from '@components/Session/auth-user-context'

export const useAuth = () => {
    const auth = useContext(AuthUserContext)
    return auth
}
