import { CircularProgress, Fab, makeStyles } from '@material-ui/core'
import React, { useState } from 'react'
import SaveIcon from '@material-ui/icons/Save'
import CheckIcon from '@material-ui/icons/Check'
import { green } from '@material-ui/core/colors'
import { callFirebaseFunction } from '../../../../utilities/firebase/functions'
import useFirebase from '../../../Hooks/context/UseFirebase'
import WithErrorDialog, { ErrorDialogProps } from '../../../Dialogs/ErrorDialog'
import EventFormNew, { combineDateAndTime } from '../EventFormNew/EventForm'
import { useForm, useFieldArray, FormProvider } from 'react-hook-form'

export type Form = {
    contactName: string
    contactNumber: string
    contactEmail: string
    organisation: string
    location: string
    slots: { startDate: Date | null; startTime: string; endDate: Date | null; endTime: string }[]
    notes: string
}

type Props = {
    onSuccess: (date: Date) => void
} & ErrorDialogProps

const NewEventForm: React.FC<Props> = ({ onSuccess, displayError }) => {
    const classes = useStyles()
    const firebase = useFirebase()

    const methods = useForm<Form>({
        defaultValues: {
            contactName: '',
            contactNumber: '',
            contactEmail: '',
            organisation: '',
            location: '',
            slots: [
                {
                    startDate: null,
                    startTime: '',
                    endDate: null,
                    endTime: '',
                },
            ],
        },
    })
    const {
        control,
        formState: { errors, isValid },
        handleSubmit,
    } = methods

    const fieldArray = useFieldArray({ control, name: 'slots', rules: { minLength: 1 } })

    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    async function onSubmit(values: Form) {
        console.log(values)
        console.log(errors)
        if (!isValid) {
            console.log('invalid')
            return
        }

        try {
            setLoading(true)
            await callFirebaseFunction(
                'bookEvent',
                firebase
            )({
                contactName: values.contactName,
                contactNumber: values.contactNumber,
                contactEmail: values.contactEmail,
                organisation: values.organisation,
                location: values.location,
                slots: values.slots.map((slot) => ({
                    startTime: combineDateAndTime(slot.startDate!, slot.startTime),
                    endTime: combineDateAndTime(slot.endDate!, slot.endTime),
                })),
                notes: values.notes,
            })
            setLoading(false)
            setSuccess(true)
            // setTimeout(() => onSuccess(startDate), 1000)
        } catch (err) {
            setLoading(false)
            displayError('There was an error booking in the event')
        }
    }

    return (
        <>
            <FormProvider {...methods}>
                <EventFormNew fieldArray={fieldArray} />
            </FormProvider>
            {/* <EventForm formValues={formValues} setFormValues={setFormValues} /> */}
            <div className={classes.saveButtonDiv}>
                <Fab
                    className={success ? classes.success : ''}
                    aria-label="save"
                    color="secondary"
                    type="submit"
                    disabled={loading}
                    onClick={handleSubmit(onSubmit)}
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
