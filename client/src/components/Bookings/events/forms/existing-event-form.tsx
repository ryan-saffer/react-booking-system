import React, { useState } from 'react'
import { useForm, FormProvider, Controller } from 'react-hook-form'
import { DateTime } from 'luxon'
import type { Event } from 'fizz-kidz'

import { useDateNavigation } from '@components/Bookings/date-navigation/date-navigation.hooks'
import type { ConfirmationDialogProps } from '@components/Dialogs/ConfirmationDialog'
import WithConfirmationDialog from '@components/Dialogs/ConfirmationDialog'
import type { ErrorDialogProps } from '@components/Dialogs/ErrorDialog'
import WithErrorDialog from '@components/Dialogs/ErrorDialog'
import EditFormButtons from '@components/Bookings/shared/edit-form-buttons'
import { combineDateAndTime } from '@utils/dateUtils'

import type { Form } from './base-event-form'
import BaseEventForm from './base-event-form'
import { useTRPC } from '@utils/trpc'
import { Grid, TextField, Typography, styled } from '@mui/material'
import { toast } from 'sonner'

import { useMutation } from '@tanstack/react-query'

type Props = {
    event: Event
} & ConfirmationDialogProps &
    ErrorDialogProps

const PREFIX = 'ExistingEventForm'

const classes = {
    disabled: `${PREFIX}-disabled`,
}

const Root = styled('div')({
    [`& .${classes.disabled}`]: {
        '& .Mui-disabled': {
            WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
        },
    },
})

const InnerExistingEventForm: React.FC<Props> = ({ event, showConfirmationDialog, displayError }) => {
    const trpc = useTRPC()
    const [loading, setLoading] = useState(false)
    const [editing, setEditing] = useState(false)

    const disabled = !editing || loading

    const updateEventMutation = useMutation(trpc.events.updateEvent.mutationOptions())
    const deleteEventMutation = useMutation(trpc.events.deleteEvent.mutationOptions())

    const { setDate } = useDateNavigation()

    const methods = useForm<Form>({
        values: {
            eventName: event.eventName,
            contactName: event.contactName,
            contactNumber: event.contactNumber,
            contactEmail: event.contactEmail,
            organisation: event.organisation,
            studio: event.studio,
            address: event.address,
            type: event.$type,
            module: event.$type === 'incursion' ? event.module : '',
            price: event.price,
            slots: [
                {
                    startDate: DateTime.fromJSDate(event.startTime),
                    startTime: DateTime.fromJSDate(event.startTime),
                    endDate: DateTime.fromJSDate(event.endTime),
                    endTime: DateTime.fromJSDate(event.endTime),
                },
            ],
            notes: event.notes,
            invoiceUrl: event.invoiceUrl,
            ...(event.$type === 'incursion' &&
                event.$incursionFormCompleted && {
                    numberOfChildren: event.numberOfChildren,
                    location: event.location,
                    parking: event.parking,
                    expectedLearning: event.expectedLearning,
                    teacherInformation: event.teacherInformation,
                    additionalInformation: event.additionalInformation,
                    hearAboutUs: event.hearAboutUs,
                }),
        } satisfies Form,
    })

    const {
        formState: { isValid },
        handleSubmit,
        reset,
        control,
    } = methods

    async function onSubmit(values: Form) {
        if (!isValid) {
            return
        }

        setLoading(true)

        try {
            const updatedBooking: Event = {
                ...event,
                eventName: values.eventName,
                contactName: values.contactName,
                contactNumber: values.contactNumber,
                contactEmail: values.contactEmail,
                organisation: values.organisation,
                address: values.address,
                price: values.price,
                startTime: combineDateAndTime(values.slots[0].startDate!, values.slots[0].startTime!),
                endTime: combineDateAndTime(values.slots[0].endDate!, values.slots[0].endTime!),
                notes: values.notes,
                invoiceUrl: values.invoiceUrl,
                ...(event.$type === 'incursion' && { module: values.module || event.module }),
                ...(event.$type === 'incursion' &&
                    event.$incursionFormCompleted && {
                        numberOfChildren: values.numberOfChildren,
                        location: values.location,
                        parking: values.parking,
                        expectedLearning: values.expectedLearning,
                        teacherInformation: values.teacherInformation,
                        additionalInformation: values.additionalInformation,
                        hearAboutUs: values.hearAboutUs,
                    }),
            }

            await updateEventMutation.mutateAsync(updatedBooking)

            setEditing(false)
            setDate(DateTime.fromJSDate(event.startTime))
            toast.success('Event updated.')
        } catch {
            displayError('There was an error updating the event')
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete() {
        setLoading(true)
        try {
            await deleteEventMutation.mutateAsync(event)
            setEditing(false)
            setDate(DateTime.fromJSDate(event.startTime))
            toast.success('Event deleted.')
        } catch (err) {
            displayError('There was an error deleting the event')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <FormProvider {...methods}>
                <BaseEventForm isNew={false} disabled={!editing || loading} editing={editing} />
                {event.$type === 'incursion' && event.$incursionFormCompleted && (
                    <Root>
                        <Grid container spacing={3} sx={{ mt: 0 }}>
                            <Grid item xs={12}>
                                <Typography variant="h6">Form Results</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="numberOfChildren"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Number of children"
                                            fullWidth
                                            variant="outlined"
                                            autoComplete="off"
                                            disabled={disabled}
                                            classes={{ root: classes.disabled }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="location"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Location"
                                            fullWidth
                                            variant="outlined"
                                            autoComplete="off"
                                            disabled={disabled}
                                            classes={{ root: classes.disabled }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="parking"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Parking"
                                            fullWidth
                                            variant="outlined"
                                            autoComplete="off"
                                            disabled={disabled}
                                            classes={{ root: classes.disabled }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="expectedLearning"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Expected outcomes"
                                            fullWidth
                                            variant="outlined"
                                            autoComplete="off"
                                            disabled={disabled}
                                            classes={{ root: classes.disabled }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="teacherInformation"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Will a teacher be present?"
                                            fullWidth
                                            variant="outlined"
                                            autoComplete="off"
                                            disabled={disabled}
                                            classes={{ root: classes.disabled }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="additionalInformation"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Additional Information"
                                            fullWidth
                                            variant="outlined"
                                            autoComplete="off"
                                            disabled={disabled}
                                            classes={{ root: classes.disabled }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="hearAboutUs"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="How did you hear about us?"
                                            fullWidth
                                            variant="outlined"
                                            autoComplete="off"
                                            disabled={disabled}
                                            classes={{ root: classes.disabled }}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </Root>
                )}
            </FormProvider>

            <EditFormButtons
                loading={loading}
                editing={editing}
                onStartEditing={() => setEditing(true)}
                onCancelEditing={() => {
                    reset()
                    setEditing(false)
                }}
                onDelete={() =>
                    showConfirmationDialog({
                        dialogTitle: 'Delete Event',
                        confirmationButtonText: 'Delete',
                        dialogContent: 'Are you sure you want to delete this event?',
                        onConfirm: handleDelete,
                    })
                }
                onSave={handleSubmit(onSubmit)}
            />
        </>
    )
}

export const ExistingEventForm = WithConfirmationDialog(WithErrorDialog(InnerExistingEventForm))
