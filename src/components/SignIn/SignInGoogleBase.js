import React, {Component} from 'react'
import * as ROUTES from '../../constants/routes'

class SignInGoogleBase extends Component {
    constructor(props) {
        super(props)
        this.state = { error: null }
    }

    onSubmit = event => {
        this.props.firebase
            .doSignInWithGoogle()
            .then(socialAuthUser => {
                this.setState({ error: null})
                this.props.history.push(ROUTES.HOME)
            })
            .catch(error => {
                this.setState({ error })
            })
        event.preventDefault()
    }

    render() {
        const { error } = this.state

        return (
            <form onSubmit={this.onSubmit}>
                <button type='submit'>Sign In with Google</button>

                {error && <p>{error.message}</p>}
            </form>
        )
    }
}

export default SignInGoogleBase