import { useContext } from 'react'
import Firebase, { FirebaseContext } from '../../Firebase'

const useFirebase = () => {
    const firebase = useContext(FirebaseContext) as Firebase
    return firebase
}

export default useFirebase