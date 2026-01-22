import Firebase, { FirebaseContext } from '.'

import type { ReactNode } from 'react'


export function FirebaseProvider({ children }: { children: ReactNode }) {
    return <FirebaseContext value={new Firebase()}>{children}</FirebaseContext>
}
