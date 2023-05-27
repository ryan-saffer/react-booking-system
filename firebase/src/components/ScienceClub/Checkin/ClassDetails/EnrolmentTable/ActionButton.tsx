import React, { useMemo, useState } from 'react'
import { Acuity, ScienceEnrolment } from 'fizz-kidz'
import { Button } from 'antd'
import { makeStyles } from '@material-ui/core'
import SignatureDialog from './SignatureDialog'
import useWindowDimensions from '../../../../Hooks/UseWindowDimensions'
import { LoginOutlined, LogoutOutlined } from '@ant-design/icons'
import { BREAKPOINT_MD, SetAppointmentLabel, UpdateEnrolment } from './EnrolmentTable'
import { DateTime } from 'luxon'

type Props = {
    appointment: Acuity.Appointment
    enrolment: ScienceEnrolment
    updateEnrolment: UpdateEnrolment
    setAppointmentLabel: SetAppointmentLabel
}

const ActionButton: React.FC<Props> = ({ appointment, enrolment, updateEnrolment, setAppointmentLabel }) => {
    const classes = useStyles()
    const { width } = useWindowDimensions()

    const [loading, setLoading] = useState(false)
    const [openSigDialog, setOpenSigDialog] = useState(false)

    const mergedPickupPeople = [
        `${appointment.firstName} ${appointment.lastName}`,
        ...enrolment.pickupPeople,
        'Fizz Kidz Staff',
    ]

    const handleSignIn = async (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.stopPropagation()
        setLoading(true)
        try {
            await setAppointmentLabel(appointment.id, 'signed-in')
        } finally {
            setLoading(false)
        }
    }

    const handleSignOutButtonClick = async (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.stopPropagation()
        // check here for lunchtime classes, which don't require a sign out
        let dateTime = DateTime.fromISO(appointment.datetime)
        if (dateTime.hour < 14) {
            // class starts before 2pm, ie lunchtime class
            handleSignOut('N/A - Lunchtime class', '')
        } else {
            setOpenSigDialog(true)
        }
    }

    const handleSignOut = async (pickupPerson: string, signature: string, staffReason: string = '') => {
        await setAppointmentLabel(appointment.id, 'signed-out')
        await updateEnrolment({
            ...enrolment,
            [appointment.id]: { pickupPerson, signature, timestamp: Date.now(), staffReason },
        })
        setOpenSigDialog(false)
    }

    const isSignedIn = useMemo(
        () => appointment.labels?.find((it) => it.id === Acuity.Constants.Labels.CHECKED_IN),
        [appointment]
    )
    const isSignedOut = useMemo(
        () => appointment.labels?.find((it) => it.id === Acuity.Constants.Labels.CHECKED_OUT),
        [appointment]
    )
    const isNotAttending = useMemo(
        () => appointment.labels?.find((it) => it.id === Acuity.Constants.Labels.NOT_ATTENDING),
        [appointment]
    )

    return (
        <>
            {(() => {
                if (isNotAttending) return null
                if (!isSignedIn && !isSignedOut) {
                    if (width > BREAKPOINT_MD) {
                        return (
                            <Button loading={loading} type="primary" onClick={handleSignIn}>
                                Sign In
                            </Button>
                        )
                    } else {
                        return (
                            <Button
                                className={classes.circleBtn}
                                loading={loading}
                                type="primary"
                                onClick={handleSignIn}
                                shape="circle"
                                icon={<LoginOutlined />}
                            />
                        )
                    }
                }
                if (isSignedIn) {
                    if (width > BREAKPOINT_MD) {
                        return (
                            <Button danger loading={loading} type="primary" onClick={handleSignOutButtonClick}>
                                Sign Out
                            </Button>
                        )
                    } else {
                        return (
                            <Button
                                className={classes.circleBtn}
                                danger
                                loading={loading}
                                type="primary"
                                onClick={handleSignOutButtonClick}
                                shape="circle"
                                icon={<LogoutOutlined />}
                            />
                        )
                    }
                }
            })()}
            <SignatureDialog
                open={openSigDialog}
                pickupPeople={mergedPickupPeople}
                onClose={() => setOpenSigDialog(false)}
                onSignOut={handleSignOut}
            />
        </>
    )
}

const useStyles = makeStyles({
    circleBtn: {
        display: 'block',
        margin: 'auto',
    },
})

export default ActionButton
