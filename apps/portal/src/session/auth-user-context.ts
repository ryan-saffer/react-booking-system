import React from 'react'

import type { AuthUser } from '@fizz-kidz/core'

const AuthUserContext = React.createContext<AuthUser | null>(null)

export default AuthUserContext
