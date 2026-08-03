import { useContext } from 'react'

import { FirebaseContext } from '@components/Firebase'
import type Firebase from '@components/Firebase'

const useFirebase = () => {
    const firebase = useContext(FirebaseContext) as Firebase
    return firebase
}

export default useFirebase
