import CheckIcon from '@mui/icons-material/Check'
import SaveIcon from '@mui/icons-material/Save'
import { Checkbox, CircularProgress, Fab, FormControlLabel, Grid, TextField, Typography, styled } from '@mui/material'
import { green } from '@mui/material/colors'
import { useMutation } from '@tanstack/react-query'
import { DateTime } from 'luxon'
import React, { useState } from 'react'
import { useForm, useFieldArray, FormProvider } from 'react-hook-form'

import type { Studio, ScienceModule } from 'fizz-kidz'

import type { ErrorDialogProps } from '@components/Dialogs/ErrorDialog'
import WithErrorDialog from '@components/Dialogs/ErrorDialog'
import { combineDateAndTime } from '@utils/dateUtils'
import { useTRPC } from '@utils/trpc'

import BaseEventForm from './base-event-form'

import type { Form } from './base-event-form'

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

const InnerNewEventForm: React.FC<Props> = ({ onSuccess, displayError }) => {
    const trpc = useTRPC()
    const [emailMessage, setEmailMessage] = useState('')
    const [emailMessageError, setEmailMessageError] = useState(false)
    const [sendConfirmationEmail, setSendConfirmationEmail] = useState(true)

    const bookEventMutation = useMutation(trpc.events.createEvent.mutationOptions())

    const methods = useForm<Form>({
        defaultValues: {
            eventName: '',
            contactName: '',
            contactNumber: '',
            contactEmail: '',
            organisation: '',
            studio: '',
            address: '',
            type: '',
            module: '',
            price: '',
            slots: [],
            notes: '',
            invoiceUrl: '',
        } satisfies Form,
    })

    const {
        control,
        formState: { isValid },
        handleSubmit,
        watch,
    } = methods

    const fieldArray = useFieldArray({ control, name: 'slots', rules: { minLength: 1 } })

    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    async function onSubmit(values: Form) {
        if (sendConfirmationEmail && !emailMessage) {
            setEmailMessageError(true)
            return
        }

        // ensure all slot times end after they start
        let dateError = false
        for (let i = 0; i < values.slots.length; i++) {
            const slot = values.slots[i]
            const start = DateTime.fromObject({
                year: slot.startDate?.year,
                month: slot.startDate?.month,
                day: slot.startDate?.day,
                hour: slot.startTime?.hour,
                minute: slot.startTime?.minute,
            })

            const end = DateTime.fromObject({
                year: slot.endDate?.year,
                month: slot.endDate?.month,
                day: slot.endDate?.day,
                hour: slot.endTime?.hour,
                minute: slot.endTime?.minute,
            })

            if (end <= start) {
                methods.setError(`slots.${i}.endDate`, { message: 'End time is before start time' })
                methods.setError(`slots.${i}.endTime`, { message: 'End time is before start time' })
                dateError = true
            }
        }

        if (!isValid || dateError) {
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
                    address: values.address,
                    studio: values.studio as Studio,
                    price: values.price,
                    notes: values.notes,
                    invoiceUrl: values.invoiceUrl,
                    ...(values.type === 'standard'
                        ? { $type: 'standard' }
                        : {
                              $type: 'incursion',
                              module: values.module as ScienceModule,
                              incursionFormSent: false,
                              $incursionFormCompleted: false,
                          }),
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
                            <Typography variant="body1" sx={{ fontSize: 12 }}>
                                {watch('type') === 'standard' ? (
                                    <i>
                                        "Hi [name],
                                        <br />
                                        This email is to confirm your booking with Fizz Kidz.
                                        <br />
                                        [Email message goes here...]"
                                    </i>
                                ) : (
                                    <i>
                                        "Hi [name],
                                        <br />
                                        We're delighted to confirm your booking. Seriously fun science is coming your
                                        way!
                                        <br />
                                        [Email message goes here...]"
                                    </i>
                                )}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Email Message"
                                placeholder="We're delighted to run..."
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

export const NewEventForm = WithErrorDialog(InnerNewEventForm)
