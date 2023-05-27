import React, { useEffect, useState } from 'react'
import useWindowDimensions from '../../../Hooks/UseWindowDimensions'
import { Acuity, ScienceEnrolment } from 'fizz-kidz'
import { makeStyles } from '@material-ui/core/styles'
import SkeletonRows from '../../../Shared/SkeletonRows'
import useQueryParam from '../../../Hooks/UseQueryParam'
import useFirebase from '../../../Hooks/context/UseFirebase'
import Heading from './Header'
import EnrolmentTable from './EnrolmentTable/EnrolmentTable'
import { Card, Result } from 'antd'
import { callAcuityClient } from '../../../../utilities/firebase/functions'

type QueryParams = {
    appointmentTypeId: string
    calendarId: string
    classId: string
    calendarName: string
    classTime: string
    class: string
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

    const appointmentTypeId = parseInt(useQueryParam<QueryParams>('appointmentTypeId') as string)
    const calendarId = parseInt(useQueryParam<QueryParams>('calendarId') as string)
    const calendarName = decodeURIComponent(useQueryParam<QueryParams>('calendarName') as string)
    const classTime = decodeURIComponent(useQueryParam<QueryParams>('classTime') as string)

    useEffect(() => {
        setLoading(true)
        let _enrolmentsMap: { [key: string]: ScienceEnrolment } = {}
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
                        const result = await callAcuityClient(
                            'searchForAppointments',
                            firebase
                        )({
                            appointmentTypeId,
                            calendarId,
                            classTime,
                        })
                        _appointments = result.data
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

                setEnrolmentsMap(_enrolmentsMap)
                setAppointments(filteredAppointments)
                setLoading(false)
            })
        return unsubscribe
    }, [])

    return (
        <div className={classes.main}>
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
                                setAppointments={setAppointments}
                                enrolmentsMap={enrolmentsMap}
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
