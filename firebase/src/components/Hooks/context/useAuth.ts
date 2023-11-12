import { useContext } from 'react'

import { AuthUserContext } from '@components/Session'

export const useAuth = () => {
    const auth = useContext(AuthUserContext)
    return auth
}
