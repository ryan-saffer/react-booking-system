import React from 'react'
import { Roles } from '../../constants/roles'

export interface AuthUser {
    uid: string
    roles: { [key in Roles]?: boolean }
}

const AuthUserContext = React.createContext<AuthUser | null>(null)

export default AuthUserContext
