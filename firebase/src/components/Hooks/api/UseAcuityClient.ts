import { useContext, useEffect, useState } from 'react'
import { Acuity, Service } from 'fizz-kidz'
import { callAcuityClient } from '../../../utilities/firebase/functions'
import Firebase, { FirebaseContext } from '../../Firebase'

const useAcuityClient = <T extends keyof Acuity.Client.AcuityFunctions>(
    method: T,
    input: Acuity.Client.AcuityFunctions[T]['input']
) => {
    const firebase = useContext(FirebaseContext) as Firebase

    const [service, setService] = useState<Service<Acuity.Client.AcuityFunctions[T]['result']['data']>>({
        status: 'loading',
    })

    useEffect(() => {
        callAcuityClient(
            method,
            firebase
        )(input)
            .then((result) => setService({ status: 'loaded', result: result.data }))
            .catch((error) => setService({ status: 'error', error }))
    }, [firebase, method, input])

    return service
}

export default useAcuityClient
