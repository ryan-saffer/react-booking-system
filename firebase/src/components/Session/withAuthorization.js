import React from 'react'
import { withRouter } from 'react-router-dom'
import { compose } from 'recompose'

import AuthUserContext from './context'
import { withFirebase } from '../Firebase/context'
import * as ROUTES from '../../constants/routes'

const isLoggedIn = authUser => !!authUser

const withAuthorization = Component => {

    class WithAuthorization extends React.Component {
        componentDidMount() {
            this.listener = this.props.firebase.auth.onAuthStateChanged(
                authUser => {
                    if (authUser) {
                        this.props.firebase.db
                            .collection('users')
                            .doc(authUser.uid)
                            .get().then(dbUser => {
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
                                        ...dbUser
                                    }
                                }
                                if (!isLoggedIn(authUser)) {
                                    this.props.history.push(ROUTES.SIGN_IN)
                                }
                            })
                    } else {
                        this.props.history.push(ROUTES.SIGN_IN)
                    }
                }
            )
        }

        componentWillUnmount() {
            this.listener()
        }

        render() {
            return (
                <AuthUserContext.Consumer>
                    {authUser => (
                        isLoggedIn(authUser) ? <Component {...this.props} /> : null
                    )}
                </AuthUserContext.Consumer>
            )
        }
    }

    return compose(
        withRouter,
        withFirebase,
    )(WithAuthorization)
}

export default withAuthorization