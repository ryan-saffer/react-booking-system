import React, { useContext, useState } from 'react'
import { Acuity } from 'fizz-kidz'
import { Switch, Typography } from 'antd'
import { makeStyles } from '@material-ui/core'
import { callAcuityClientV2 } from '../../../../utilities/firebase/functions'
import Firebase, { FirebaseContext } from '../../../Firebase'
import { WithErrorModal } from '../../../Hooks/UseErrorDialog'
import { DateTime } from 'luxon'

type Props = {
    appointment: Acuity.Appointment
} & WithErrorModal

const AppointmnetRow: React.FC<Props> = ({ appointment, showError }) => {
    const classes = useStyles()

    const firebase = useContext(FirebaseContext) as Firebase

    const notAttending =
        appointment.labels &&
        appointment.labels.length > 0 &&
        appointment.labels[0].id === Acuity.Constants.Labels.NOT_ATTENDING

    const [attending, setAttending] = useState(!notAttending)
    const [loading, setSetloading] = useState(false)

    const toggle = async (checked: boolean) => {
        setSetloading(true)
        try {
            await callAcuityClientV2(
                'updateAppointment',
                firebase
            )({ id: appointment.id, labels: checked ? [] : [{ id: Acuity.Constants.Labels.NOT_ATTENDING }] })
            if (checked) {
                setAttending(true)
            } else {
                setAttending(false)
            }
        } catch (error) {
            console.error('error updating label', error)
            showError('Your appointment could not be updated. Please try again later.')
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
