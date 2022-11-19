import { Acuity, Calendar, ScheduleScienceAppointmentParams } from 'fizz-kidz'
import React, { useEffect, useState } from 'react'
import { callAcuityClient, callFirebaseFunction } from '../../../utilities/firebase/functions'
import Root from '../../Shared/Root'
import { LeftOutlined } from '@ant-design/icons'
import { Button, Result, Typography } from 'antd'
import { Grow, makeStyles } from '@material-ui/core'
import AppointmentTypeCard from './AppointmentTypeCard'
import FormSwitcher from './FormSwitcher'
import Loader from '../shared/Loader'
import useMixpanel from '../../Hooks/context/UseMixpanel'
import useFirebase from '../../Hooks/context/UseFirebase'
import { MixpanelEvents } from '../../Mixpanel/Events'

export type FormSubmission = (params: ScheduleScienceAppointmentParams) => void

const BookingForm = () => {
    const classes = useStyles()

    const firebase = useFirebase()
    const mixpanel = useMixpanel()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [success, setSuccess] = useState(false)
    const [appointmentTypes, setAppointmentTypes] = useState<Acuity.AppointmentType[]>()
    const [selectedClass, setSelectedClass] = useState<Acuity.AppointmentType>()
    const [logoMap, setLogoMap] = useState<{ [key: string]: string }>()

    useEffect(() => {
        async function fetchAppointmentTypes() {
            try {
                const [appointmentTypes, calendars] = await Promise.all([
                    callAcuityClient('getAppointmentTypes', firebase)({}),
                    firebase.db.collection('acuityCalendars').get(),
                ])

                const filterCategory = process.env.REACT_APP_ENV === 'prod' ? 'Science Club' : 'TEST'
                const scienceAppointmentTypes = appointmentTypes.data.filter(
                    (it) => it.category === filterCategory && it.calendarIDs.length !== 0
                )
                setAppointmentTypes(scienceAppointmentTypes)
                setLogoMap(
                    Object.assign(
                        {},
                        ...calendars.docs.map((it) => {
                            const calendar = it.data() as Calendar
                            return { [calendar.id]: calendar.logoUrl }
                        })
                    )
                )
            } catch (err) {
                console.error(err)
                setError(true)
                mixpanel.track(MixpanelEvents.SCIENCE_FORM_ERROR_LOADING_FORM)
            }
            setLoading(false)
        }
        fetchAppointmentTypes()
        mixpanel.track(MixpanelEvents.SCIENCE_FORM_VIEW)
    }, [])

    const handleSubmit = async (params: ScheduleScienceAppointmentParams) => {
        setLoading(true)
        const mixpanelProps = {
            appointment_type: params.className,
            parent_email: params.parent.email,
        }
        try {
            await callFirebaseFunction('scheduleScienceAppointment', firebase)(params)
            setSuccess(true)
            mixpanel.track(MixpanelEvents.SCIENCE_FORM_ENROLMENT_CONFIRMED, mixpanelProps)
        } catch (err) {
            console.error(err)
            setError(true)
            mixpanel.track(MixpanelEvents.SCIENCE_FORM_ERROR_SUBMITTING_FORM, mixpanelProps)
        }
        setLoading(false)
    }

    const renderClassSelection = () => {
        if (loading) {
            return <Loader className={classes.loader} />
        }
        if (selectedClass && logoMap) {
            return (
                <>
                    <Button
                        style={{ width: 'fit-content', marginBottom: 8 }}
                        icon={<LeftOutlined />}
                        onClick={() => setSelectedClass(undefined)}
                    >
                        Go back
                    </Button>
                    <Grow>
                        <AppointmentTypeCard
                            appointmentType={selectedClass}
                            logoUrl={logoMap[selectedClass.calendarIDs[0]]}
                            onClick={() => {}}
                        />
                    </Grow>
                </>
            )
        }
        if (appointmentTypes && logoMap) {
            return appointmentTypes.map((it) => (
                <AppointmentTypeCard
                    key={it.id}
                    appointmentType={it}
                    logoUrl={logoMap[it.calendarIDs[0]]}
                    onClick={() => setSelectedClass(it)}
                />
            ))
        }
    }

    return (
        <Root color="green" width="centered">
            <Typography.Title level={4} className={classes.title}>
                Science Program Enrolment Form
            </Typography.Title>
            {(() => {
                if (error) {
                    return (
                        <Result
                            status="500"
                            title="Something went wrong"
                            subTitle="We're sorry... it looks like something broke. Please try again later, or reach out via email at bookings@fizzkidz.com.au."
                        />
                    )
                }

                if (success) {
                    return (
                        <Result
                            status="success"
                            title="Enrolment Confirmed"
                            subTitle="We've sent you a confirmation email, as well as an email where you can manage your enrolment. We can't wait to see you at the start of term!"
                        />
                    )
                }

                return (
                    <div className={classes.root}>
                        {renderClassSelection()}
                        {selectedClass && <FormSwitcher appointmentType={selectedClass} onSubmit={handleSubmit} />}
                    </div>
                )
            })()}
        </Root>
    )
}

const useStyles = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    },
    title: {
        margin: 8,
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
        margin: 0,
    },
    loader: {
        marginTop: 24,
    },
})

export default BookingForm
