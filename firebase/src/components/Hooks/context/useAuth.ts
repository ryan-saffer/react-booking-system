import { useContext } from 'react'
import { AuthUserContext } from '../../Session'

export const useAuth = () => {
    const auth = useContext(AuthUserContext)
    return auth
}
