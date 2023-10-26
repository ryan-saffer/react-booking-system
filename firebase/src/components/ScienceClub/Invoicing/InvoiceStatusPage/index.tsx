import React, { useEffect, useState } from 'react'
import { ScienceEnrolment, Service } from 'fizz-kidz'
import useFirebase from '../../../Hooks/context/UseFirebase'
import Heading from './Heading'
import SkeletonRows from '../../../Shared/SkeletonRows'
import useWindowDimensions from '../../../Hooks/UseWindowDimensions'
import { Result } from 'antd'
import EnrolmentsTable from './EnrolmentsTable/EnrolmentsTable'
import { useSearchParams } from 'react-router-dom'

export const ScienceClassDashboard: React.FC = () => {
    const firebase = useFirebase()
    const { height } = useWindowDimensions()

    const [searchParams] = useSearchParams()
    const appointmentTypeId = parseInt(searchParams.get('appointmentTypeId')!)
    const calendarName = searchParams.get('calendarName') ?? ''

    const [enrolmentsService, setEnrolmentsService] = useState<Service<ScienceEnrolment[]>>({ status: 'loading' })

    useEffect(() => {
        const unsubscribe = firebase.db
            .collection('scienceAppointments')
            .where('appointmentTypeId', '==', appointmentTypeId)
            .where('status', '==', 'active')
            .onSnapshot((snapshot) => {
                let enrolments = snapshot.docs.map((enrolment) => {
                    return {
                        ...(enrolment.data() as ScienceEnrolment),
                        id: enrolment.id,
                    }
                })
                enrolments = enrolments.sort((a, b) => a.parent.firstName.localeCompare(b.parent.firstName))
                setEnrolmentsService({ status: 'loaded', result: enrolments })
            })

        return () => unsubscribe()
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
