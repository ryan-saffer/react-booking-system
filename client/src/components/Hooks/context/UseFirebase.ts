import { useContext } from 'react'

import type Firebase from '@components/Firebase'
import { FirebaseContext } from '@components/Firebase'

const useFirebase = () => {
    const firebase = useContext(FirebaseContext) as Firebase
    return firebase
}

export default useFirebase
