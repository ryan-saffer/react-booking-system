import { Checkbox, CircularProgress, Fab, FormControlLabel, Grid, TextField, Typography, styled } from '@mui/material'
import React, { useState } from 'react'
import SaveIcon from '@mui/icons-material/Save'
import CheckIcon from '@mui/icons-material/Check'
import { green } from '@mui/material/colors'
import WithErrorDialog, { ErrorDialogProps } from '../../../Dialogs/ErrorDialog'
import BaseEventForm, { Form } from './BaseEventForm'
import { useForm, useFieldArray, FormProvider } from 'react-hook-form'
import { combineDateAndTime } from '@utils/dateUtils'
import { trpc } from '@utils/trpc'
import { DateTime } from 'luxon'

const PREFIX = 'NewEventForm'

const classes = {
    saveButtonDiv: `${PREFIX}-saveButtonDiv`,
    success: `${PREFIX}-success`,
    progress: `${PREFIX}-progress`,
}

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.saveButtonDiv}`]: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: 24,
    },
    [`& .${classes.success}`]: {
        marginTop: theme.spacing(3),
        backgroundColor: green[500],
    },
    [`& .${classes.progress}`]: {},
}))

type Props = {
    onSuccess: (date: Date) => void
} & ErrorDialogProps

const _NewEventForm: React.FC<Props> = ({ onSuccess, displayError }) => {
    const [emailMessage, setEmailMessage] = useState('')
    const [emailMessageError, setEmailMessageError] = useState(false)
    const [sendConfirmationEmail, setSendConfirmationEmail] = useState(true)

    const bookEventMutation = trpc.events.createEvent.useMutation()

    const methods = useForm<Form>({
        defaultValues: {
            eventName: 'Ryans Test Event',
            contactName: 'Ryan Saffer',
            contactNumber: '0413892120',
            contactEmail: 'ryansaffer@gmail.com',
            organisation: 'Fizz Kidz',
            location: 'Chadstone',
            price: '$1800 + GST',
            slots: [
                {
                    startDate: DateTime.fromObject({ day: 29, month: 11, hour: 13, minute: 0, second: 0 }),
                    startTime: DateTime.fromObject({ day: 29, month: 11, hour: 13, minute: 0, second: 0 }),
                    endDate: DateTime.fromObject({ day: 29, month: 11, hour: 14, minute: 0, second: 0 }),
                    endTime: DateTime.fromObject({ day: 29, month: 11, hour: 14, minute: 0, second: 0 }),
                },
                {
                    startDate: DateTime.fromObject({ day: 29, month: 11, hour: 15, minute: 0, second: 0 }),
                    startTime: DateTime.fromObject({ day: 29, month: 11, hour: 15, minute: 0, second: 0 }),
                    endDate: DateTime.fromObject({ day: 29, month: 11, hour: 16, minute: 0, second: 0 }),
                    endTime: DateTime.fromObject({ day: 29, month: 11, hour: 16, minute: 0, second: 0 }),
                },
            ],
            notes: 'Some notes...',
        } satisfies Form,
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
            await bookEventMutation.mutateAsync({
                event: {
                    eventName: values.eventName,
                    contactName: values.contactName,
                    contactNumber: values.contactNumber,
                    contactEmail: values.contactEmail,
                    organisation: values.organisation,
                    location: values.location,
                    price: values.price,
                    notes: values.notes,
                    type: 'standard',
                },
                slots: values.slots.map((slot) => ({
                    startTime: combineDateAndTime(slot.startDate!, slot.startTime!),
                    endTime: combineDateAndTime(slot.endDate!, slot.endTime!),
                })),
                sendConfirmationEmail,
                emailMessage,
            })
            setLoading(false)
            setSuccess(true)
            setTimeout(() => onSuccess(values.slots[0].startDate!.toJSDate()), 1000)
        } catch (err) {
            setLoading(false)
            displayError('There was an error booking in the event')
        }
    }

    return (
        <Root>
            <FormProvider {...methods}>
                <BaseEventForm isNew={true} fieldArray={fieldArray} />
            </FormProvider>
            <Grid container spacing={3}>
                {sendConfirmationEmail && (
                    <>
                        <Grid item xs={12} sx={{ marginTop: 2 }}>
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
        </Root>
    )
}

export const NewEventForm = WithErrorDialog(_NewEventForm)
