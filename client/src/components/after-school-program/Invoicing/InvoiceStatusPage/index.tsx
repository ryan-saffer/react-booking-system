import { Result } from 'antd'
import { AfterSchoolEnrolment, Service } from 'fizz-kidz'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import useWindowDimensions from '@components/Hooks/UseWindowDimensions'
import useFirebase from '@components/Hooks/context/UseFirebase'
import SkeletonRows from '@components/Shared/SkeletonRows'

import { EnrolmentsTable } from './EnrolmentsTable/EnrolmentsTable'
import Heading from './Heading'

export const AfterSchoolProgramInvoicing: React.FC = () => {
    const firebase = useFirebase()
    const { height } = useWindowDimensions()

    const [searchParams] = useSearchParams()
    const appointmentTypeId = parseInt(searchParams.get('appointmentTypeId')!)
    const calendarName = searchParams.get('calendarName') ?? ''

    const [enrolmentsService, setEnrolmentsService] = useState<Service<AfterSchoolEnrolment[]>>({ status: 'loading' })

    useEffect(() => {
        const unsubscribe = firebase.db
            .collection('scienceAppointments')
            .where('appointmentTypeId', '==', appointmentTypeId)
            .where('status', '==', 'active')
            .onSnapshot((snapshot) => {
                let enrolments = snapshot.docs.map((enrolment) => {
                    return {
                        ...(enrolment.data() as AfterSchoolEnrolment),
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
