import { useContext } from 'react'

import { FirebaseContext } from '@integrations/firebase'
import type Firebase from '@integrations/firebase'

const useFirebase = () => {
    const firebase = useContext(FirebaseContext) as Firebase
    return firebase
}

export default useFirebase
