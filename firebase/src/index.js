import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './components/App'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import Firebase, { FirebaseContext } from './components/Firebase'
import { MixpanelContext } from './components/Mixpanel/MixpanelContext'
import mixpanel from 'mixpanel-browser'

mixpanel.init(
    process.env.REACT_APP_ENV === 'prod'
        ? process.env.REACT_APP_MIXPANEL_API_KEY_PROD
        : process.env.REACT_APP_MIXPANEL_API_KEY_DEV,
    { debug: process.env.REACT_APP_ENV === 'dev' }
)

ReactDOM.render(
    <FirebaseContext.Provider value={new Firebase()}>
        <MixpanelContext.Provider value={mixpanel}>
            <App />
        </MixpanelContext.Provider>
    </FirebaseContext.Provider>,
    document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register()
