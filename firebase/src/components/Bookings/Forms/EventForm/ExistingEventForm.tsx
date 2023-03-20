import { EventBooking } from 'fizz-kidz'
import React, { useState } from 'react'
import EventForm, { combineDateAndTime, isFormValid } from './EventForm'
import { mapEventToForm } from './FormFields'
import EditFormButtons from '../EditFormButtons'
import useFirebase from '../../../Hooks/context/UseFirebase'
import WithConfirmationDialog, { ConfirmationDialogProps } from '../../../Dialogs/ConfirmationDialog'

type Props = {
    event: EventBooking
    onDeleteEvent: (date: Date) => void
} & ConfirmationDialogProps

const ExistingEventForm: React.FC<Props> = ({ event, showConfirmationDialog, onDeleteEvent }) => {
    const firebase = useFirebase()

    const [formValues, setFormValues] = useState(mapEventToForm(event))
    const [loading, setLoading] = useState(false)
    const [editing, setEditing] = useState(false)
    const [success, setSuccess] = useState(false)

    async function handleSave() {
        const { isValid, formValuesCopy } = isFormValid(formValues)
        if (!isValid) {
            setFormValues(formValuesCopy)
            return
        }

        setLoading(true)

        const startDate = combineDateAndTime(formValues.date.value!, formValues.startTime.value)
        const endDate = combineDateAndTime(formValues.date.value!, formValues.endTime.value)

        const updatedBooking: EventBooking = {
            id: event.id,
            contactName: formValues.contactName.value,
            contactNumber: formValues.contactNumber.value,
            contactEmail: formValues.contactEmail.value,
            organisation: formValues.organisation.value,
            location: formValues.location.value,
            startTime: startDate,
            endTime: endDate,
            notes: formValues.notes.value,
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
            <EventForm formValues={formValues} setFormValues={setFormValues} disabled={!editing} />
            <EditFormButtons
                loading={loading}
                editing={editing}
                success={success}
                onStartEditing={() => setEditing(true)}
                onCancelEditing={() => {
                    setFormValues(mapEventToForm(event))
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
                onSave={handleSave}
            />
        </>
    )
}

export default WithConfirmationDialog(ExistingEventForm)
