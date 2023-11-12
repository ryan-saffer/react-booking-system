import { Alert, Button, Result, Typography } from 'antd'
import { AcuityTypes, Calendar, ScheduleScienceAppointmentParams } from 'fizz-kidz'
import { useEffect, useState } from 'react'

import { LeftOutlined } from '@ant-design/icons'
import useFirebase from '@components/Hooks/context/UseFirebase'
import useMixpanel from '@components/Hooks/context/UseMixpanel'
import { MixpanelEvents } from '@components/Mixpanel/Events'
import Root from '@components/Shared/Root'
import { Grow } from '@mui/material'
import { callAcuityClient, callFirebaseFunction } from '@utils/firebase/functions'

import Loader from '../shared/Loader'
import AppointmentTypeCard from './AppointmentTypeCard'
import FormSwitcher from './FormSwitcher'

export type FormSubmission = (params: ScheduleScienceAppointmentParams) => void

export const BookingForm = () => {
    const firebase = useFirebase()
    const mixpanel = useMixpanel()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [success, setSuccess] = useState(false)
    const [appointmentTypes, setAppointmentTypes] = useState<AcuityTypes.Api.AppointmentType[]>()
    const [selectedClass, setSelectedClass] = useState<AcuityTypes.Api.AppointmentType>()
    const [logoMap, setLogoMap] = useState<{ [key: string]: string }>()

    useEffect(() => {
        async function fetchAppointmentTypes() {
            try {
                const [appointmentTypes, calendars] = await Promise.all([
                    callAcuityClient(
                        'getAppointmentTypes',
                        firebase
                    )({
                        category: import.meta.env.VITE_ENV === 'prod' ? 'Science Club' : 'TEST',
                        availableToBook: true,
                    }),
                    firebase.db.collection('acuityCalendars').get(),
                ])
                setAppointmentTypes(appointmentTypes.data)
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            return <Loader style={{ marginTop: 24 }} />
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
        if (appointmentTypes?.length && logoMap) {
            return appointmentTypes.map((it) => (
                <AppointmentTypeCard
                    key={it.id}
                    appointmentType={it}
                    logoUrl={logoMap[it.calendarIDs[0]]}
                    onClick={() => setSelectedClass(it)}
                />
            ))
        } else {
            return (
                <Alert
                    message="No classes available"
                    description="Unfortunately there are no classes available to book at the moment. Please try again later."
                    type="error"
                />
            )
        }
    }

    return (
        <Root color="green" width="centered">
            <Typography.Title level={4} style={{ margin: 8, textAlign: 'center' }}>
                Science Program Enrolment Form
            </Typography.Title>
            {(() => {
                if (error) {
                    return (
                        <Result
                            status="500"
                            title="Something went wrong"
                            subTitle="Please try again later, or reach out via email at bookings@fizzkidz.com.au."
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
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        {renderClassSelection()}
                        {selectedClass && <FormSwitcher appointmentType={selectedClass} onSubmit={handleSubmit} />}
                    </div>
                )
            })()}
        </Root>
    )
}
