import './index.css'

import mixpanel from 'mixpanel-browser'
import { createRoot } from 'react-dom/client'

import { App } from '@components/App'
import Firebase, { FirebaseContext } from '@components/Firebase'
import { MixpanelContext } from '@components/Mixpanel/MixpanelContext'

mixpanel.init(
    import.meta.env.VITE_ENV === 'prod'
        ? import.meta.env.VITE_MIXPANEL_API_KEY_PROD
        : import.meta.env.VITE_MIXPANEL_API_KEY_DEV,
    { debug: import.meta.env.VITE_ENV === 'dev' }
)

const root = createRoot(document.getElementById('root')!)
root.render(
    <FirebaseContext.Provider value={new Firebase()}>
        <MixpanelContext.Provider value={mixpanel}>
            <App />
        </MixpanelContext.Provider>
    </FirebaseContext.Provider>
)
