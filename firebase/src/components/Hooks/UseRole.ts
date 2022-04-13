import React, { useContext } from 'react'
import { Roles } from '../../constants/roles'

import { AuthUser, AuthUserContext } from '../Session'

const useRole = () => {
    const authUser = useContext<AuthUser>(AuthUserContext)
        if (authUser.roles["ADMIN"]) {
            return Roles.ADMIN
        } else if (authUser.roles["RESTRICTED"]) {
            return Roles.RESTRICTED
        } else {
            return Roles.BASIC
        }
}

export default useRole