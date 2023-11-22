import { FirebaseContext } from './context'

export const withFirebase = (Component: any) => (props: any) =>
    (
        <FirebaseContext.Consumer>
            {(firebase: any) => <Component {...props} firebase={firebase} />}
        </FirebaseContext.Consumer>
    )
