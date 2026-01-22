import { LoginOutlined, LogoutOutlined } from '@ant-design/icons'
import { styled } from '@mui/material/styles'
import { Button } from 'antd'
import { DateTime } from 'luxon'
import React, { useMemo, useState } from 'react'

import type { AcuityTypes, AfterSchoolEnrolment } from 'fizz-kidz'
import { AcuityConstants } from 'fizz-kidz'

import useWindowDimensions from '@components/Hooks/UseWindowDimensions'


import { BREAKPOINT_MD } from './EnrolmentTable'
import SignatureDialog from './SignatureDialog'

import type { SetAppointmentLabel, UpdateEnrolment } from './EnrolmentTable'

const PREFIX = 'ActionButton'

const classes = {
    circleBtn: `${PREFIX}-circleBtn`,
}

const Root = styled('div')({
    [`& .${classes.circleBtn}`]: {
        display: 'block',
        margin: 'auto',
    },
})

type Props = {
    appointment: AcuityTypes.Api.Appointment
    enrolment: AfterSchoolEnrolment
    updateEnrolment: UpdateEnrolment
    setAppointmentLabel: SetAppointmentLabel
}

const ActionButton: React.FC<Props> = ({ appointment, enrolment, updateEnrolment, setAppointmentLabel }) => {
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
        const dateTime = DateTime.fromISO(appointment.datetime)
        if (dateTime.hour < 14) {
            // class starts before 2pm, ie lunchtime class
            handleSignOut('N/A - Lunchtime class', '')
        } else {
            setOpenSigDialog(true)
        }
    }

    const handleSignOut = async (pickupPerson: string, signature: string, staffReason: string = '') => {
        await updateEnrolment(enrolment.id, {
            signatures: {
                ...enrolment.signatures,
                [appointment.id]: { pickupPerson, signature, timestamp: Date.now(), staffReason },
            },
        })
        await setAppointmentLabel(appointment.id, 'signed-out')
        setOpenSigDialog(false)
    }

    const isSignedIn = useMemo(
        () => appointment.labels?.find((it) => it.id === AcuityConstants.Labels.CHECKED_IN),
        [appointment]
    )
    const isSignedOut = useMemo(
        () => appointment.labels?.find((it) => it.id === AcuityConstants.Labels.CHECKED_OUT),
        [appointment]
    )
    const isNotAttending = useMemo(
        () => appointment.labels?.find((it) => it.id === AcuityConstants.Labels.NOT_ATTENDING),
        [appointment]
    )

    return (
        <Root>
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
                            <Button
                                style={{ background: '#16a34a' }}
                                loading={loading}
                                type="primary"
                                onClick={handleSignOutButtonClick}
                            >
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
        </Root>
    )
}

export default ActionButton
