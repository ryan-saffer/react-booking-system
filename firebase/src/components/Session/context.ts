import React from 'react'
import { Roles } from '../../constants/roles'

export interface AuthUser {
    roles: { [key in Roles]?: boolean }
}

const AuthUserContext = React.createContext<AuthUser>({ roles: {} })

export default AuthUserContext