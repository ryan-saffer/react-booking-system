import { Service, Acuity, Calendar, ScheduleScienceAppointmentParams } from 'fizz-kidz'
import React, { useContext, useEffect, useState } from 'react'
import { callAcuityClientV2, callFirebaseFunction } from '../../../utilities/firebase/functions'
import Firebase, { FirebaseContext } from '../../Firebase'
import Root from '../../Shared/Root'
import { LoadingOutlined } from '@ant-design/icons'
import { Card, Result, Spin, Typography } from 'antd'
import { Grow, makeStyles } from '@material-ui/core'
import AppointmentTypeCard from './AppointmentTypeCard'
import Form from './Form'

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />

const BookingForm = () => {
    const classes = useStyles()

    const firebase = useContext(FirebaseContext) as Firebase

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [success, setSuccess] = useState(false)
    const [appointmentTypes, setAppointmentTypes] = useState<Acuity.AppointmentType[]>()
    const [selectedClass, setSelectedClass] = useState<Acuity.AppointmentType>()
    const [calendars, setCalendars] = useState<Calendar[]>()

    useEffect(() => {
        async function fetchAppointmentTypes() {
            try {
                const [appointmentTypes, calendars] = await Promise.all([
                    callAcuityClientV2('getAppointmentTypes', firebase)(),
                    firebase.db.collection('acuityCalendars').get(),
                ])

                const filterCategory = process.env.REACT_APP_ENV === 'prod' ? 'Science Club' : 'TEST'
                const scienceAppointmentTypes = appointmentTypes.data.filter(
                    (it) => it.category === filterCategory && it.calendarIDs.length !== 0
                )
                setAppointmentTypes(scienceAppointmentTypes)
                setCalendars(calendars.docs.map((it) => it.data() as Calendar))
            } catch (err) {
                console.error(err)
                setError(true)
            }
            setLoading(false)
        }
        fetchAppointmentTypes()
    }, [])

    const handleSubmit = async (params: ScheduleScienceAppointmentParams) => {
        setLoading(true)
        try {
            await callFirebaseFunction('scheduleScienceAppointment', firebase)(params)
            setSuccess(true)
        } catch (err) {
            console.error(err)
            setError(true)
        }
        setLoading(false)
    }

    const renderClassSelection = () => {
        if (loading) {
            return <Spin style={{ marginTop: 24 }} indicator={antIcon} />
        }
        if (selectedClass && calendars) {
            return (
                <Grow>
                    <AppointmentTypeCard
                        appointmentType={selectedClass}
                        calendars={calendars}
                        onClick={() => setSelectedClass(undefined)}
                    />
                </Grow>
            )
        }
        if (appointmentTypes && calendars) {
            return appointmentTypes.map((it) => (
                <AppointmentTypeCard
                    key={it.id}
                    appointmentType={it}
                    calendars={calendars}
                    onClick={() => setSelectedClass(it)}
                />
            ))
        }
    }

    const renderForm = () => {
        if (selectedClass) {
            return <Form appointmentType={selectedClass} onSubmit={handleSubmit} />
        }
    }

    if (error) {
        return (
            <Root>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography.Title level={5} className={classes.title}>
                        Science Program Booking Form
                    </Typography.Title>
                    <Result
                        status="500"
                        title="Something went wrong"
                        subTitle="There was a problem during your registartion. Please try again, or email us at bookings@fizzkidz.com.au"
                    />
                </div>
            </Root>
        )
    }

    if (success) {
        return (
            <Root>
                <Result
                    status="success"
                    title="Registration Confirmed"
                    subTitle="We've sent you a confirmation email where you can manage your enrolment. We can't wait to see you at the start of term!"
                />
            </Root>
        )
    }

    return (
        <Root>
            <div className={classes.root}>
                <Typography.Title level={5} className={classes.title}>
                    Science Program Booking Form
                </Typography.Title>
                {renderClassSelection()}
                {renderForm()}
            </div>
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
        textAlign: 'center'
    },
})

export default BookingForm
