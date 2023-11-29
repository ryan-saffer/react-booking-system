import React, { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { DateTime } from 'luxon'
import { Event } from 'fizz-kidz'

import { useDateNavigation } from '@components/Bookings/DateNavigation/DateNavigation.hooks'
import WithConfirmationDialog, { ConfirmationDialogProps } from '@components/Dialogs/ConfirmationDialog'
import WithErrorDialog, { ErrorDialogProps } from '@components/Dialogs/ErrorDialog'
import EditFormButtons from '@components/Bookings/Forms/EditFormButtons'
import { combineDateAndTime } from '@utils/dateUtils'

import BaseEventForm, { Form } from './BaseEventForm'
import { trpc } from '@utils/trpc'

type Props = {
    event: Event
} & ConfirmationDialogProps &
    ErrorDialogProps

const _ExistingEventForm: React.FC<Props> = ({ event, showConfirmationDialog, displayError }) => {
    const [loading, setLoading] = useState(false)
    const [editing, setEditing] = useState(false)
    const [success, setSuccess] = useState(false)

    const updateEventMutation = trpc.events.updateEvent.useMutation()
    const deleteEventMutation = trpc.events.deleteEvent.useMutation()

    const { setDate } = useDateNavigation()

    const methods = useForm<Form>({
        values: {
            eventName: event.eventName,
            contactName: event.contactName,
            contactNumber: event.contactNumber,
            contactEmail: event.contactEmail,
            organisation: event.organisation,
            address: event.address,
            type: event.type,
            module: event.type === 'incursion' ? event.module : '',
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
        } satisfies Form,
    })

    const {
        formState: { isValid },
        handleSubmit,
        reset,
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
            }

            await updateEventMutation.mutateAsync(updatedBooking)

            setSuccess(true)
            setTimeout(() => {
                setEditing(false)
                setSuccess(false)
                setDate(DateTime.fromJSDate(event.startTime))
            }, 1000)
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
            setSuccess(true)
            setTimeout(() => {
                setEditing(false)
                setSuccess(false)
                setDate(DateTime.fromJSDate(event.startTime))
            }, 1000)
        } catch (err) {
            displayError('There was an error deleting the event')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <FormProvider {...methods}>
                <BaseEventForm isNew={false} disabled={!editing || loading} />
            </FormProvider>
            <EditFormButtons
                loading={loading}
                editing={editing}
                success={success}
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

export const ExistingEventForm = WithConfirmationDialog(WithErrorDialog(_ExistingEventForm))
