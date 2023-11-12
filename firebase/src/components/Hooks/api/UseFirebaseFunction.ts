import { FirebaseFunctions, Service } from 'fizz-kidz'
import { useContext, useEffect, useState } from 'react'

import Firebase, { FirebaseContext } from '@components/Firebase'
import { callFirebaseFunction } from '@utils/firebase/functions'

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return service
}

export default useFirebaseFunction
