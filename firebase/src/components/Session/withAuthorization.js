import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import AuthUserContext from './context'
import { withFirebase } from '../Firebase/context'
import * as ROUTES from '../../constants/routes'
import * as LogoGif from '../../drawables/fizz_logo.gif'

const isLoggedIn = (authUser) => !!authUser

const withAuthorization = (Component) => {
    const WithAuthorization = (props) => {
        const navigate = useNavigate()

        useEffect(() => {
            const unsubscribe = props.firebase.auth.onAuthStateChanged((authUser) => {
                if (authUser) {
                    props.firebase.db
                        .collection('users')
                        .doc(authUser.uid)
                        .get()
                        .then((dbUser) => {
                            if (dbUser.exists) {
                                dbUser = dbUser.data()
                                // default empty roles
                                if (!dbUser.roles) {
                                    dbUser.roles = {}
                                }

                                // merge auth and db user
                                authUser = {
                                    uid: authUser.uid,
                                    email: authUser.email,
                                    ...dbUser,
                                }
                            }
                            if (!isLoggedIn(authUser)) {
                                navigate(ROUTES.SIGN_IN)
                            }
                        })
                } else {
                    navigate(ROUTES.SIGN_IN)
                }
            })

            return unsubscribe
        })

        return (
            <AuthUserContext.Consumer>
                {(authUser) =>
                    isLoggedIn(authUser) ? (
                        <Component {...props} />
                    ) : (
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
            </AuthUserContext.Consumer>
        )
    }

    return withFirebase(WithAuthorization)
}

export default withAuthorization
