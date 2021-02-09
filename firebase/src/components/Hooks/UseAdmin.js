import React, { useContext } from 'react'

import { AuthUserContext } from '../Session'
import * as ROLES from '../../constants/roles'

const useAdmin = () => {

    const authUser = useContext(AuthUserContext)

    return authUser.roles[ROLES.ADMIN] ? true : false
}

export default useAdmin