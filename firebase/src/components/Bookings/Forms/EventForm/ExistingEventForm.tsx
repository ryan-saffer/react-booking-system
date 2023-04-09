import { EventBooking } from 'fizz-kidz'
import React, { useState } from 'react'
import EventForm, { Form, combineDateAndTime } from './EventForm'
import EditFormButtons from '../EditFormButtons'
import useFirebase from '../../../Hooks/context/UseFirebase'
import WithConfirmationDialog, { ConfirmationDialogProps } from '../../../Dialogs/ConfirmationDialog'
import { useForm, FormProvider } from 'react-hook-form'

type Props = {
    event: EventBooking
    onDeleteEvent: (date: Date) => void
} & ConfirmationDialogProps

const ExistingEventForm: React.FC<Props> = ({ event, showConfirmationDialog, onDeleteEvent }) => {
    const firebase = useFirebase()

    const [loading, setLoading] = useState(false)
    const [editing, setEditing] = useState(false)
    const [success, setSuccess] = useState(false)

    const methods = useForm<Form>({
        defaultValues: {
            contactName: event.contactName,
            contactNumber: event.contactNumber,
            contactEmail: event.contactEmail,
            organisation: event.organisation,
            location: event.location,
            slots: [
                {
                    startDate: event.startTime,
                    startTime: event.startTime.toLocaleTimeString(['en-au'], { hourCycle: 'h24' }),
                    endDate: event.endTime,
                    endTime: event.endTime.toLocaleTimeString(['en-au'], { hourCycle: 'h24' }),
                },
            ],
            notes: event.notes,
        },
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

        const updatedBooking: EventBooking = {
            ...event,
            contactName: values.contactName,
            contactNumber: values.contactNumber,
            contactEmail: values.contactEmail,
            organisation: values.organisation,
            location: values.location,
            startTime: combineDateAndTime(values.slots[0].startDate!, values.slots[0].startTime),
            endTime: combineDateAndTime(values.slots[0].endDate!, values.slots[0].endTime),
            notes: values.notes,
        }

        await firebase.db.collection('events').doc(event.id).set(updatedBooking, { merge: true })

        setLoading(false)
        setSuccess(true)
        setTimeout(() => {
            setEditing(false)
            setSuccess(false)
        }, 1000)
    }

    function handleDelete() {
        firebase.db.collection('events').doc(event.id).delete()
        onDeleteEvent(event.startTime)
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

export default WithConfirmationDialog(ExistingEventForm)
