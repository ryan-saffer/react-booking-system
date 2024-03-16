import React from 'react'

import { AuthUser } from './auth-provider'

const AuthUserContext = React.createContext<AuthUser | null>(null)

export default AuthUserContext
