import {
    Checkbox,
    CircularProgress,
    Fab,
    FormControlLabel,
    Grid,
    TextField,
    Typography,
    makeStyles,
} from '@material-ui/core'
import React, { useState } from 'react'
import SaveIcon from '@material-ui/icons/Save'
import CheckIcon from '@material-ui/icons/Check'
import { green } from '@material-ui/core/colors'
import { callFirebaseFunction } from '../../../../utilities/firebase/functions'
import useFirebase from '../../../Hooks/context/UseFirebase'
import WithErrorDialog, { ErrorDialogProps } from '../../../Dialogs/ErrorDialog'
import EventForm, { Form, combineDateAndTime } from './EventForm'
import { useForm, useFieldArray, FormProvider } from 'react-hook-form'

type Props = {
    onSuccess: (date: Date) => void
} & ErrorDialogProps

const NewEventForm: React.FC<Props> = ({ onSuccess, displayError }) => {
    const classes = useStyles()
    const firebase = useFirebase()

    const [emailMessage, setEmailMessage] = useState('')
    const [emailMessageError, setEmailMessageError] = useState(false)
    const [sendConfirmationEmail, setSendConfirmationEmail] = useState(true)

    const methods = useForm<Form>({
        defaultValues: {
            eventName: '',
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
        formState: { isValid },
        handleSubmit,
    } = methods

    const fieldArray = useFieldArray({ control, name: 'slots', rules: { minLength: 1 } })

    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    async function onSubmit(values: Form) {
        if (sendConfirmationEmail && !emailMessage) {
            setEmailMessageError(true)
            return
        }
        if (!isValid) {
            return
        }

        try {
            setLoading(true)
            await callFirebaseFunction(
                'bookEvent',
                firebase
            )({
                event: {
                    eventName: values.eventName,
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
                },
                sendConfirmationEmail,
                emailMessage,
            })
            setLoading(false)
            setSuccess(true)
            setTimeout(() => onSuccess(values.slots[0].startDate!), 1000)
        } catch (err) {
            setLoading(false)
            displayError('There was an error booking in the event')
        }
    }

    return (
        <>
            <FormProvider {...methods}>
                <EventForm isNew={true} fieldArray={fieldArray} />
            </FormProvider>
            <Grid container spacing={3}>
                {sendConfirmationEmail && (
                    <>
                        <Grid item xs={12}>
                            <Typography variant="h6">Email Message</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Email Message"
                                placeholder="This message will be included in the confirmation email"
                                value={emailMessage}
                                error={emailMessageError}
                                helperText={
                                    emailMessageError && 'Email message is required if sending confirmation email'
                                }
                                multiline
                                rows={5}
                                fullWidth
                                variant="outlined"
                                autoComplete="off"
                                onChange={(e) => {
                                    const val = e.target.value
                                    setEmailMessage(val)
                                    setEmailMessageError(!val)
                                }}
                            />
                        </Grid>
                    </>
                )}
                <Grid item xs={12}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                id="sendConfirmationEmail"
                                color="secondary"
                                name="sendConfirmationEmail"
                                checked={sendConfirmationEmail}
                                onChange={(e) => setSendConfirmationEmail(e.target.checked)}
                            />
                        }
                        label="Send confirmation email"
                        style={{ float: 'right' }}
                    />
                </Grid>
            </Grid>
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
