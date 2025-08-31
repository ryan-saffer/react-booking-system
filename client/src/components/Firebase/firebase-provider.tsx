import type { ReactNode } from 'react'

import Firebase, { FirebaseContext } from '.'

export function FirebaseProvider({ children }: { children: ReactNode }) {
    return <FirebaseContext.Provider value={new Firebase()}>{children}</FirebaseContext.Provider>
}
