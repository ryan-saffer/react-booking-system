import type { AuthUser } from 'fizz-kidz'
import React from 'react'

const AuthUserContext = React.createContext<AuthUser | null>(null)

export default AuthUserContext
