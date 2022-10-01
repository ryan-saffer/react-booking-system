import React, { useEffect, useMemo, useState } from 'react'
import useWindowDimensions from '../../../Hooks/UseWindowDimensions'
import { Acuity, ScienceEnrolment } from 'fizz-kidz'
import { makeStyles } from '@material-ui/core/styles'
import SkeletonRows from '../../../Shared/SkeletonRows'
import useQueryParam from '../../../Hooks/UseQueryParam'
import useFirebase from '../../../Hooks/context/UseFirebase'
import useAcuityClient from '../../../Hooks/api/UseAcuityClient'
import Heading from './Header'
import EnrolmentTable from './EnrolmentTable/EnrolmentTable'
import { Card, Result } from 'antd'
import { callAcuityClientV2 } from '../../../../utilities/firebase/functions'

type QueryParams = {
    appointmentTypeId: string
    calendarId: string
    classId: string
    calendarName: string
    classTime: string
}

export type EnrolmentsMap = { [key: string]: ScienceEnrolment }

export function getEnrolment(appointment: Acuity.Appointment, enrolmentsMap: { [key: string]: ScienceEnrolment }) {
    const firestoreId = Acuity.Utilities.retrieveFormAndField(
        appointment,
        Acuity.Constants.Forms.FIRESTORE,
        Acuity.Constants.FormFields.FIRESTORE_ID
    )
    return enrolmentsMap[firestoreId]
}

const ScienceClubCheckinClassDetails: React.FC = () => {
    const classes = useStyles()

    const firebase = useFirebase()
    const { height } = useWindowDimensions()

    // a map will speed up finding the corresponding firestore booking from acuity appointment
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [enrolmentsMap, setEnrolmentsMap] = useState<EnrolmentsMap>({})
    const [appointments, setAppointments] = useState<Acuity.Appointment[]>([])

    const appointmentTypeId = parseInt(useQueryParam<QueryParams>('appointmentTypeId'))
    const calendarId = parseInt(useQueryParam<QueryParams>('calendarId'))
    const calendarName = decodeURIComponent(useQueryParam<QueryParams>('calendarName'))
    const classTime = useQueryParam<QueryParams>('classTime')

    useEffect(() => {
        async function init() {
            try {
                const [enrolments, appointments] = await Promise.all([
                    firebase.db
                        .collection('scienceAppointments')
                        .where('appointmentTypeId', '==', appointmentTypeId)
                        .where('status', '==', 'active')
                        .get(),
                    callAcuityClientV2(
                        'searchForAppointments',
                        firebase
                    )({
                        appointmentTypeId,
                        calendarId,
                        classTime,
                    }),
                ])

                let obj: { [key: string]: ScienceEnrolment } = {}
                enrolments.docs.forEach((doc) => {
                    const enrolment = doc.data() as ScienceEnrolment
                    obj[enrolment.id] = enrolment
                })

                // sort appointments by child name
                appointments.data.sort((a, b) => {
                    const enrolment1 = getEnrolment(a, obj)
                    const enrolment2 = getEnrolment(b, obj)
                    return enrolment1.child.firstName.localeCompare(enrolment2.child.firstName)
                })

                setEnrolmentsMap(obj)
                setAppointments(appointments.data)
            } catch {
                setError(true)
            }
            setLoading(false)
        }
        init()
    }, [])

    return (
        <div className={classes.main}>
            <Heading />
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
                                setAppointments={setAppointments}
                                enrolmentsMap={enrolmentsMap}
                                setEnrolmentsMap={setEnrolmentsMap}
                                calendarName={calendarName}
                            />
                        )
                    })()}
                </Card>
            </div>
        </div>
    )
}

const useStyles = makeStyles({
    main: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
    root: {
        // backgroundColor: '#f0f2f2',
        backgroundImage: 'linear-gradient(45deg, #2FEAA8, #028CF3)',
        minHeight: '100vh',
        paddingBottom: 24,
        display: 'flex',
        justifyContent: 'center',
    },
    card: {
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
    noEnrolments: {
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

export default ScienceClubCheckinClassDetails
