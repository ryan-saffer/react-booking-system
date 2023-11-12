import React, { useEffect } from 'react'
import { AcuityTypes } from 'fizz-kidz'
import useAcuityClient from '../../Hooks/api/UseAcuityClient'
import Loader from '../shared/Loader'
import Form from './Form'
import { Alert, Typography } from 'antd'
import useMixpanel from '../../Hooks/context/UseMixpanel'
import { MixpanelEvents } from '../../Mixpanel/Events'
import { FormSubmission } from '.'

type Props = {
    appointmentType: AcuityTypes.Api.AppointmentType
    onSubmit: FormSubmission
}

/**
 * Decides whether to render the registration form,
 * or the waiting list form if the class is full.
 */
const FormSwitcher: React.FC<Props> = ({ appointmentType, onSubmit }) => {
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
                }
            } else {
                mixpanel.track(MixpanelEvents.SCIENCE_FORM_NO_CLASSES, {
                    appointment_type: appointmentType.name,
                })
            }
        }
        if (classesService.status === 'error') {
            mixpanel.track(MixpanelEvents.SCIENCE_FORM_ERROR_LOADING_CLASSES, {
                appointment_type: appointmentType.name,
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classesService.status])

    switch (classesService.status) {
        case 'loading':
            return <Loader style={{ marginTop: 24 }} />
        case 'loaded':
            if (classesService.result.length > 0) {
                const spotsLeft = classesService.result[0].slotsAvailable
                const numClasses = classesService.result.length

                if (spotsLeft > 0) {
                    return (
                        <>
                            <Typography.Title style={{ textAlign: 'center', marginBottom: 0, marginTop: 12 }} level={5}>
                                ${parseInt(appointmentType.price) * numClasses} for {numClasses === 8 ? 'an' : 'a'}{' '}
                                {numClasses} week term
                            </Typography.Title>
                            <Form appointmentType={appointmentType} onSubmit={onSubmit} />
                        </>
                    )
                } else {
                    // no spots left
                    // this could be swapped out with a waiting list form in the future
                    return (
                        <Alert
                            style={{ marginTop: 24 }}
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
                        style={{ marginTop: 24 }}
                        message="Class Full"
                        description="Unfortunately this class is full for the term."
                        type="error"
                    />
                )
            }
        default: // error
            return (
                <Alert
                    style={{ marginTop: 24 }}
                    message="Something went wrong"
                    description="We're sorry. Something went wrong while retrieving this programs details. Please try again later."
                    type="error"
                />
            )
    }
}

export default FormSwitcher
