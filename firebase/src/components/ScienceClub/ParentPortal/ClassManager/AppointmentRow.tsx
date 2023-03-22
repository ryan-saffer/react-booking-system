import React, { useState } from 'react'
import { Acuity } from 'fizz-kidz'
import { Switch, Typography } from 'antd'
import { makeStyles } from '@material-ui/core'
import { callAcuityClient } from '../../../../utilities/firebase/functions'
import { WithErrorModal } from '../../../Hooks/UseErrorDialog'
import { DateTime } from 'luxon'
import useFirebase from '../../../Hooks/context/UseFirebase'
import useMixpanel from '../../../Hooks/context/UseMixpanel'
import { MixpanelEvents } from '../../../Mixpanel/Events'

type Props = {
    appointment: Acuity.Appointment
} & WithErrorModal

const AppointmnetRow: React.FC<Props> = ({ appointment, showError }) => {
    const classes = useStyles()

    const firebase = useFirebase()
    const mixpanel = useMixpanel()

    const notAttending =
        appointment.labels &&
        appointment.labels.length > 0 &&
        appointment.labels[0].id === Acuity.Constants.Labels.NOT_ATTENDING

    const [attending, setAttending] = useState(!notAttending)
    const [loading, setSetloading] = useState(false)

    const toggle = async (checked: boolean) => {
        setSetloading(true)
        try {
            await callAcuityClient(
                'updateAppointment',
                firebase
            )({ id: appointment.id, labels: checked ? [] : [{ id: Acuity.Constants.Labels.NOT_ATTENDING }] })
            if (checked) {
                setAttending(true)
            } else {
                setAttending(false)
            }
            mixpanel.track(MixpanelEvents.SCIENCE_PORTAL_ATTENDANCE_TOGGLED, {
                distinct_id: firebase.auth.currentUser ? firebase.auth.currentUser.email : appointment.email,
                attempted_to_toggle_on: checked,
                acuity_apointment_id: appointment.id,
            })
        } catch (error) {
            showError({ message: 'Your appointment could not be updated. Please try again later.' })
            mixpanel.track(MixpanelEvents.SCIENCE_PORTAL_ERROR_TOGGLING_ATTENDANCE, {
                distinct_id: firebase.auth.currentUser ? firebase.auth.currentUser.email : appointment.email,
                toggled_on: checked,
            })
        }
        setSetloading(false)
    }

    return (
        <>
            <div className={classes.row}>
                <Typography.Text>
                    {DateTime.fromISO(appointment.datetime).toLocaleString({
                        weekday: 'short',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                    })}
                </Typography.Text>
                <Switch checked={attending} onChange={toggle} loading={loading} />
            </div>
        </>
    )
}

const useStyles = makeStyles({
    row: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
})

export default AppointmnetRow
