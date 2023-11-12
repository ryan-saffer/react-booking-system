import { useContext, useEffect, useState } from 'react'
import { AcuityTypes, Service } from 'fizz-kidz'
import { callAcuityClient } from '../../../utilities/firebase/functions'
import Firebase, { FirebaseContext } from '../../Firebase'

const useAcuityClient = <T extends keyof AcuityTypes.Client.AcuityFunctions>(
    method: T,
    input: AcuityTypes.Client.AcuityFunctions[T]['input']
) => {
    const firebase = useContext(FirebaseContext) as Firebase

    const [service, setService] = useState<Service<AcuityTypes.Client.AcuityFunctions[T]['result']['data']>>({
        status: 'loading',
    })

    useEffect(() => {
        callAcuityClient(
            method,
            firebase
        )(input)
            .then((result) => setService({ status: 'loaded', result: result.data }))
            .catch((error) => setService({ status: 'error', error }))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return service
}

export default useAcuityClient
