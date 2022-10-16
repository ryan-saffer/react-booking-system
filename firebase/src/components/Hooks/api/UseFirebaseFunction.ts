import { useContext, useEffect, useState } from 'react'
import { FirebaseFunctions, Service } from 'fizz-kidz'
import Firebase, { FirebaseContext } from '../../Firebase'
import { callFirebaseFunction } from '../../../utilities/firebase/functions'

const useFirebaseFunction = <T extends keyof FirebaseFunctions>(method: T, input: FirebaseFunctions[T]['input']) => {
    const firebase = useContext(FirebaseContext) as Firebase

    const [service, setService] = useState<Service<FirebaseFunctions[T]['result']['data']>>({ status: 'loading' })

    useEffect(() => {
        callFirebaseFunction(
            method,
            firebase
        )(input)
            .then((result) => setService({ status: 'loaded', result: result.data }))
            .catch((error) => setService({ status: 'error', error }))
    }, [])

    return service
}

export default useFirebaseFunction
