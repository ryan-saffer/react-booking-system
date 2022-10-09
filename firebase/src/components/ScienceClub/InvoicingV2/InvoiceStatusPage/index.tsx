import React, { useEffect, useState } from 'react'
import { ScienceEnrolment, Service } from 'fizz-kidz'
import useFirebase from '../../../Hooks/context/UseFirebase'
import useQueryParam from '../../../Hooks/UseQueryParam'
import Heading from './Heading'
import SkeletonRows from '../../../Shared/SkeletonRows'
import useWindowDimensions from '../../../Hooks/UseWindowDimensions'
import { Result } from 'antd'
import EnrolmentsTable from './EnrolmentsTable/EnrolmentsTable'

interface QueryParams {
    appointmentTypeId: string
    calendarName: string
}

const ScienceClassDashboard: React.FC = () => {
    const firebase = useFirebase()
    const { height } = useWindowDimensions()

    const appointmentTypeId = parseInt(useQueryParam<QueryParams>('appointmentTypeId') as string)
    const calendarName = decodeURIComponent(useQueryParam<QueryParams>('calendarName') ?? '')

    const [enrolmentsService, setEnrolmentsService] = useState<Service<ScienceEnrolment[]>>({ status: 'loading' })

    useEffect(() => {
        firebase.db
            .collection('scienceAppointments')
            .where('appointmentTypeId', '==', appointmentTypeId)
            .where('status', '==', 'active')
            .get()
            .then((result) => {
                let enrolments = result.docs.map((enrolment) => {
                    return {
                        ...(enrolment.data() as ScienceEnrolment),
                        id: enrolment.id,
                    }
                })
                enrolments = enrolments.sort((a, b) => a.parent.firstName.localeCompare(b.parent.firstName))
                setEnrolmentsService({ status: 'loaded', result: enrolments })
            })
    }, [])

    return (
        <>
            <Heading />
            {(() => {
                switch (enrolmentsService.status) {
                    case 'loading':
                        return <SkeletonRows rowCount={(height - 64) / 64} />
                    case 'loaded':
                        return <EnrolmentsTable enrolments={enrolmentsService.result} calendar={calendarName} />
                    default: // error
                        return (
                            <Result
                                status="500"
                                title="Oh no"
                                subTitle="There was an error retrieving the enrolments"
                            />
                        )
                }
            })()}
        </>
    )
}

export default ScienceClassDashboard
