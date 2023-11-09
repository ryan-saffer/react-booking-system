import { EventBooking } from 'fizz-kidz'
import React, { useState } from 'react'
import EventForm, { Form, combineDateAndTime } from './EventForm'
import EditFormButtons from '../EditFormButtons'
import useFirebase from '../../../Hooks/context/UseFirebase'
import WithConfirmationDialog, { ConfirmationDialogProps } from '../../../Dialogs/ConfirmationDialog'
import { useForm, FormProvider } from 'react-hook-form'
import { callFirebaseFunction } from '../../../../utilities/firebase/functions'
import WithErrorDialog, { ErrorDialogProps } from '../../../Dialogs/ErrorDialog'
import { DateTime } from 'luxon'
import { useDateNavigation } from '../../DateNavigation/DateNavigation'

type Props = {
    event: EventBooking
} & ConfirmationDialogProps &
    ErrorDialogProps

const ExistingEventForm: React.FC<Props> = ({ event, showConfirmationDialog, displayError }) => {
    const firebase = useFirebase()

    const [loading, setLoading] = useState(false)
    const [editing, setEditing] = useState(false)
    const [success, setSuccess] = useState(false)

    const { setDate } = useDateNavigation()

    const methods = useForm<Form>({
        defaultValues: {
            eventName: event.eventName,
            contactName: event.contactName,
            contactNumber: event.contactNumber,
            contactEmail: event.contactEmail,
            organisation: event.organisation,
            location: event.location,
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
            const updatedBooking: EventBooking = {
                ...event,
                contactName: values.contactName,
                contactNumber: values.contactNumber,
                contactEmail: values.contactEmail,
                organisation: values.organisation,
                location: values.location,
                startTime: combineDateAndTime(values.slots[0].startDate!, values.slots[0].startTime!),
                endTime: combineDateAndTime(values.slots[0].endDate!, values.slots[0].endTime!),
                notes: values.notes,
            }

            await callFirebaseFunction('updateEvent', firebase)(updatedBooking)

            setSuccess(true)
            setTimeout(() => {
                setEditing(false)
                setSuccess(false)
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
            await callFirebaseFunction('deleteEvent', firebase)(event)
            setDate(DateTime.fromJSDate(event.startTime))
        } catch (err) {
            displayError('There was an error deleting the event')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <FormProvider {...methods}>
                <EventForm isNew={false} disabled={!editing || loading} />
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

export default WithConfirmationDialog(WithErrorDialog(ExistingEventForm))
