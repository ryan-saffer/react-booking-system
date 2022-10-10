import React, { useEffect } from 'react'
import { Acuity, ScheduleScienceAppointmentParams } from 'fizz-kidz'
import useAcuityClient from '../../Hooks/api/UseAcuityClient'
import Loader from '../shared/Loader'
import Form from './Form'
import { makeStyles } from '@material-ui/core'
import { Alert, Typography } from 'antd'
import useMixpanel from '../../Hooks/context/UseMixpanel'
import { MixpanelEvents } from '../../Mixpanel/Events'

type Props = {
    appointmentType: Acuity.AppointmentType
    onSubmit: (params: ScheduleScienceAppointmentParams) => void
}

/**
 * Decides whether to render the registration form,
 * or the waiting list form if the class is full.
 */
const FormSwitcher: React.FC<Props> = ({ appointmentType, onSubmit }) => {
    const classes = useStyles()

    const mixpanel = useMixpanel()

    const classesService = useAcuityClient('classAvailability', {
        appointmentTypeId: appointmentType.id,
        includeUnavailable: false,
    })

    // Mixpanel Tracking
    useEffect(() => {
        if (classesService.status === 'loaded') {
            if (classesService.result.length > 0) {
                const spotsLeft = classesService.result[0].slotsAvailable
                if (spotsLeft < 0) {
                    mixpanel.track(MixpanelEvents.SCIENCE_FORM_CLASS_FULL, {
                        appointment_type: appointmentType.name,
                    })
                } else {
                    mixpanel.track(MixpanelEvents.SCIENCE_FORM_NO_CLASSES, {
                        appointment_type: appointmentType.name,
                    })
                }
            }
        }
        if (classesService.status === 'error') {
            mixpanel.track(MixpanelEvents.SCIENCE_FORM_ERROR_LOADING_CLASSES, {
                appointment_type: appointmentType.name,
            })
        }
    }, [classesService])

    switch (classesService.status) {
        case 'loading':
            return <Loader className={classes.topMargin} />
        case 'loaded':
            if (classesService.result.length > 0) {
                const spotsLeft = classesService.result[0].slotsAvailable
                const numClasses = classesService.result.length
                if (spotsLeft > 0) {
                    return (
                        <>
                            <Typography.Title className={classes.price} level={5}>
                                ${parseInt(appointmentType.price) * numClasses} for a {numClasses} week term
                            </Typography.Title>
                            <Form appointmentType={appointmentType} onSubmit={onSubmit} />
                        </>
                    )
                } else {
                    // no spots left
                    // this could be swapped out with a waiting list form in the future
                    return (
                        <Alert
                            className={classes.topMargin}
                            message="Class Full"
                            description="Unfortunately this class is full for the term."
                            type="error"
                        />
                    )
                }
            } else {
                // no upcoming classes left
                return (
                    <Alert
                        className={classes.topMargin}
                        message="No upcoming classes"
                        description="Sorry, it seems there are no upcoming classes for this program."
                        type="error"
                    />
                )
            }
        default: // error
            return (
                <Alert
                    className={classes.topMargin}
                    message="Something went wrong"
                    description="We're sorry. Something went wrong while retrieving this programs details. Please try again later."
                    type="error"
                />
            )
    }
}

const useStyles = makeStyles({
    topMargin: {
        marginTop: 24,
    },
    price: {
        textAlign: 'center',
        marginBottom: 0,
        marginTop: 12,
    },
})

export default FormSwitcher
