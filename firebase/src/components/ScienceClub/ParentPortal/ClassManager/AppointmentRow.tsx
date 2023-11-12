import { Switch, Typography } from 'antd'
import { AcuityConstants, AcuityTypes } from 'fizz-kidz'
import { DateTime } from 'luxon'
import React, { useState } from 'react'

import { WithErrorModal } from '@components/Hooks/UseErrorDialog'
import useFirebase from '@components/Hooks/context/UseFirebase'
import useMixpanel from '@components/Hooks/context/UseMixpanel'
import { MixpanelEvents } from '@components/Mixpanel/Events'
import { callAcuityClient } from '@utils/firebase/functions'

type Props = {
    appointment: AcuityTypes.Api.Appointment
} & WithErrorModal

const AppointmnetRow: React.FC<Props> = ({ appointment, showError }) => {
    const firebase = useFirebase()
    const mixpanel = useMixpanel()

    const notAttending =
        appointment.labels &&
        appointment.labels.length > 0 &&
        appointment.labels[0].id === AcuityConstants.Labels.NOT_ATTENDING

    const [attending, setAttending] = useState(!notAttending)
    const [loading, setSetloading] = useState(false)

    const toggle = async (checked: boolean) => {
        setSetloading(true)
        try {
            await callAcuityClient(
                'updateAppointment',
                firebase
            )({ id: appointment.id, labels: checked ? [] : [{ id: AcuityConstants.Labels.NOT_ATTENDING }] })
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
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

export default AppointmnetRow
