import { useContext } from 'react'

import AuthUserContext from '@session/auth-user-context'

export const useAuth = () => {
    const auth = useContext(AuthUserContext)
    return auth
}
