import { CircularProgress, Fab, makeStyles } from '@material-ui/core'
import React, { useState } from 'react'
import { getEmptyFormValues } from './FormFields'
import SaveIcon from '@material-ui/icons/Save'
import CheckIcon from '@material-ui/icons/Check'
import { green } from '@material-ui/core/colors'
import { callFirebaseFunction } from '../../../../utilities/firebase/functions'
import useFirebase from '../../../Hooks/context/UseFirebase'
import EventForm, { combineDateAndTime, isFormValid } from './EventForm'
import WithErrorDialog, { ErrorDialogProps } from '../../../Dialogs/ErrorDialog'

type Props = {
    onSuccess: (date: Date) => void
} & ErrorDialogProps

const NewEventForm: React.FC<Props> = ({ onSuccess, displayError }) => {
    const classes = useStyles()
    const firebase = useFirebase()

    const [formValues, setFormValues] = useState(getEmptyFormValues())

    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    async function handleSubmit() {
        const { isValid, formValuesCopy } = isFormValid(formValues)
        if (!isValid) {
            setFormValues(formValuesCopy)
            return
        }

        const startDate = combineDateAndTime(formValues.date.value!, formValues.startTime.value)
        const endDate = combineDateAndTime(formValues.date.value!, formValues.endTime.value)

        try {
            setLoading(true)
            await callFirebaseFunction(
                'bookEvent',
                firebase
            )({
                contactName: formValues.contactName.value,
                contactNumber: formValues.contactNumber.value,
                contactEmail: formValues.contactEmail.value,
                organisation: formValues.organisation.value,
                location: formValues.location.value,
                startTime: startDate,
                endTime: endDate,
                notes: formValues.notes.value,
            })
            setLoading(false)
            setSuccess(true)
            setTimeout(() => onSuccess(startDate), 1000)
        } catch (err) {
            setLoading(false)
            displayError('There was an error booking in the event')
        }
    }

    return (
        <>
            <EventForm formValues={formValues} setFormValues={setFormValues} />
            <div className={classes.saveButtonDiv}>
                <Fab
                    className={success ? classes.success : ''}
                    aria-label="save"
                    color="secondary"
                    type="submit"
                    disabled={loading}
                    onClick={handleSubmit}
                >
                    {success ? <CheckIcon /> : <SaveIcon />}
                </Fab>
                {loading && <CircularProgress size={68} className={classes.progress} />}
            </div>
        </>
    )
}

const useStyles = makeStyles((theme) => ({
    saveButtonDiv: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: 24,
    },
    success: {
        marginTop: theme.spacing(3),
        backgroundColor: green[500],
    },
    progress: {
        color: green[500],
        position: 'absolute',
        marginTop: '-6px',
        marginRight: '-6px',
    },
}))

export default WithErrorDialog(NewEventForm)
