import React from 'react'

import { Role } from '@constants/roles'

export interface AuthUser {
    uid: string
    role: Role
}

const AuthUserContext = React.createContext<AuthUser | null>(null)

export default AuthUserContext
