import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import * as ROUTES from '../../constants/routes'
import * as LogoGif from '../../drawables/fizz_logo.gif'
import useFirebase from '../Hooks/context/UseFirebase'
import { Roles } from '../../constants/roles'
import { useAuth } from '../Hooks/context/useAuth'

/**
 * Wraps a component with authorised roles, to ensure only correct users see the content.
 *
 * @param roles
 * @param Component
 * @returns
 */
const withAuthorization = (roles: Roles[], Component: React.FunctionComponent) => {
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
            // admin is allowed to view all pages
            if (authUser.roles.ADMIN) return <Component />

            // empty roles means any authenticated user can view it
            if (roles.length === 0) {
                return <Component />
            }

            // otherwise check if the current user has the specified role
            for (const [key, value] of Object.entries(authUser.roles)) {
                if (roles.includes(key as Roles) && value) {
                    return <Component />
                }
            }
            return <h1>Not authorised!</h1>
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
