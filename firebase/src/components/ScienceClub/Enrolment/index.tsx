import React from 'react'
import { Acuity } from 'fizz-kidz'
import useUpdateScienceEnrolment from '../../Hooks/UseUpdateScienceEnrolment'
import useQueryParam from '../../Hooks/UseQueryParam'

const EnrolmentPage = () => {

    const email = useQueryParam<Acuity.Client.UpdateScienceEnrolmentParams>('email') as string
    const appointmentTypeId = parseInt(useQueryParam<Acuity.Client.UpdateScienceEnrolmentParams>('appointmentTypeId') as string)
    const childName = useQueryParam<Acuity.Client.UpdateScienceEnrolmentParams>('childName') as string
    const continuing = useQueryParam<Acuity.Client.UpdateScienceEnrolmentParams>('continuing') as Acuity.Client.ContinuingOptions

    const service = useUpdateScienceEnrolment({
        email,
        appointmentTypeId,
        childName,
        continuing
    })

    switch (service.status) {
        case "loading":
            return (
                <h1>Loading...</h1>
            )
        case "loaded":
            return (
                <>
                    <h1>Done...! You are all set for the term.</h1>
                    <h2>Parent Name: {service.result[0].firstName} </h2>
                </>
            )
        case "error":
            return (
                <h1>Something went wrong... please try again later, or give us a call.</h1>
            )
    }
}

export default EnrolmentPage