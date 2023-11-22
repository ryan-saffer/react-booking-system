import { Card, Result } from 'antd'
import { AcuityTypes, ScienceEnrolment } from 'fizz-kidz'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import useWindowDimensions from '@components/Hooks/UseWindowDimensions'
import useFirebase from '@components/Hooks/context/UseFirebase'
import SkeletonRows from '@components/Shared/SkeletonRows'
import { styled } from '@mui/material/styles'

import { getEnrolment } from './ClassDetails.utils'
import EnrolmentTable from './EnrolmentTable/EnrolmentTable'
import Heading from './Header'
import { trpc } from '@utils/trpc'

const PREFIX = 'ScienceClubCheckinClassDetails'

const classes = {
    main: `${PREFIX}-main`,
    root: `${PREFIX}-root`,
    card: `${PREFIX}-card`,
    noEnrolments: `${PREFIX}-noEnrolments`,
}

const Root = styled('div')({
    [`&.${classes.main}`]: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
    [`& .${classes.root}`]: {
        // backgroundColor: '#f0f2f2',
        backgroundImage: 'linear-gradient(45deg, #2FEAA8, #028CF3)',
        minHeight: '100vh',
        paddingBottom: 24,
        display: 'flex',
        justifyContent: 'center',
    },
    [`& .${classes.card}`]: {
        marginLeft: 16,
        marginRight: 16,
        width: '100%',
        height: 'fit-content',
        marginTop: 36,
        borderRadius: 16,
        boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
        '& .ant-card-body': {
            padding: 12,
        },
    },
    [`& .${classes.noEnrolments}`]: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        color: 'grey',
        pointerEvents: 'none',
    },
})

export type EnrolmentsMap = { [key: string]: ScienceEnrolment }

export const ScienceClubCheckinClassDetails: React.FC = () => {
    const firebase = useFirebase()
    const { height } = useWindowDimensions()

    // a map will speed up finding the corresponding firestore booking from acuity appointment
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [enrolmentsMap, setEnrolmentsMap] = useState<EnrolmentsMap>({})
    const [appointments, setAppointments] = useState<AcuityTypes.Api.Appointment[]>([])

    const searchForAppointmentsMutation = trpc.acuity.searchForAppointments.useMutation()

    const [searchParams] = useSearchParams()
    const appointmentTypeId = parseInt(searchParams.get('appointmentTypeId')!)
    const calendarId = parseInt(searchParams.get('calendarId')!)
    const calendarName = decodeURIComponent(searchParams.get('calendarName')!)
    const classTime = decodeURIComponent(searchParams.get('classTime')!)

    const updateAppointment = (newAppointment: AcuityTypes.Api.Appointment) => {
        setAppointments((appointments) =>
            appointments.map((oldAppointment) => {
                if (oldAppointment.id === newAppointment.id) {
                    return newAppointment
                } else {
                    return oldAppointment
                }
            })
        )
    }

    useEffect(() => {
        setLoading(true)
        const _enrolmentsMap: { [key: string]: ScienceEnrolment } = {}
        // needed to track within the scope of this render
        let _isFirstLoad = true
        let _appointments = appointments
        const unsubscribe = firebase.db
            .collection('scienceAppointments')
            .where('appointmentTypeId', '==', appointmentTypeId)
            .where('status', '==', 'active')
            .onSnapshot(async (snapshot) => {
                if (_isFirstLoad) {
                    try {
                        _appointments = await searchForAppointmentsMutation.mutateAsync({
                            appointmentTypeId,
                            calendarId,
                            classTime,
                        })
                    } catch (err) {
                        console.error(err)
                        setError(true)
                        return
                    }
                }

                snapshot.docs.forEach((doc) => {
                    const enrolment = doc.data() as ScienceEnrolment
                    _enrolmentsMap[enrolment.id] = enrolment
                })

                setEnrolmentsMap(_enrolmentsMap)

                if (_isFirstLoad) {
                    // filter out appointments that are not stored in firestore
                    // side effect from migration. should be impossible. remove at end of term 4 22.
                    const filteredAppointments = _appointments.filter((it) => getEnrolment(it, _enrolmentsMap))

                    // sort appointments by child name
                    filteredAppointments.sort((a, b) => {
                        const enrolment1 = getEnrolment(a, _enrolmentsMap)
                        const enrolment2 = getEnrolment(b, _enrolmentsMap)
                        return enrolment1.child.firstName.localeCompare(enrolment2.child.firstName, [], {
                            numeric: false,
                        })
                    })

                    _isFirstLoad = false
                    _appointments = filteredAppointments

                    setAppointments(filteredAppointments)
                    setLoading(false)
                }
            })
        return unsubscribe
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Root className={classes.main}>
            <Heading time={classTime} />
            <div className={classes.root}>
                <Card className={classes.card}>
                    {(() => {
                        if (loading) {
                            return <SkeletonRows rowCount={(height - 64) / 64} />
                        }
                        if (error) {
                            return <Result status="500" title="500" subTitle="Sorry, something went wrong." />
                        }
                        return (
                            <EnrolmentTable
                                appointments={appointments}
                                updateAppointment={updateAppointment}
                                enrolmentsMap={enrolmentsMap}
                                calendarName={calendarName}
                            />
                        )
                    })()}
                </Card>
            </div>
        </Root>
    )
}
