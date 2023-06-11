import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import * as ROUTES from '../../constants/routes'
import * as LogoGif from '../../drawables/fizz_logo.gif'
import useFirebase from '../Hooks/context/UseFirebase'
import { ROLES, Role } from '../../constants/roles'
import { useAuth } from '../Hooks/context/useAuth'
import Unauthorised from './Unauthorised'

/**
 * Wraps component with authorised roles, to ensure only correct users see the content.
 * Wrapped components will show the Fizzing logo until authentication has settled.
 * Once settled, unauthorised users will be taken back to sign-in.
 *
 * @param roles an array of roles allow to view this page. An empty array means any authenticated user can view this page.
 * No need to provide Role.ADMIN, as admins can view everything.
 * @param Component the component you want to wrap
 */
const withAuthorization = (roles: Role[], Component: React.FunctionComponent) => {
    const WithAuthorization = (): React.JSX.Element => {
        const firebase = useFirebase()
        const authUser = useAuth()
        const navigate = useNavigate()

        useEffect(() => {
            const unsubscribe = firebase.auth.onAuthStateChanged((authUser) => {
                if (!authUser) {
                    navigate(ROUTES.SIGN_IN)
                }
            })

            return unsubscribe
        })

        if (authUser) {
            if (!authUser.role || !ROLES.includes(authUser.role)) {
                return <Unauthorised showLogout />
            }

            if (authUser.role === 'ADMIN')
                // admin is allowed to view all pages
                return <Component />

            // empty roles means any authenticated user can view it
            if (roles.length === 0) {
                return <Component />
            }

            // otherwise check if the current user has the specified role
            if (roles.includes(authUser.role)) return <Component />

            return <Unauthorised />
        } else {
            return (
                <img
                    src={LogoGif.default}
                    style={{
                        position: 'fixed',
                        width: '200px',
                        top: '50%',
                        left: '50%',
                        marginTop: '-200px',
                        marginLeft: '-100px',
                    }}
                    alt="Fizz Kidz Logo"
                />
            )
        }
    }

    return WithAuthorization
}

export default withAuthorization
