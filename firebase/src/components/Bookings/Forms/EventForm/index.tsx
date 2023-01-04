import { CircularProgress, Fab, Grid, makeStyles, Typography } from '@material-ui/core'
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import React, { ChangeEvent, useEffect, useState } from 'react'
import CustomTextField from './CustomTextField'
import { FormFields, getEmptyFormValues } from './FormFields'
import DateFnsUtils from '@date-io/date-fns'
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date'
import SaveIcon from '@material-ui/icons/Save'
import CheckIcon from '@material-ui/icons/Check'
import { green } from '@material-ui/core/colors'
import moment from 'moment'
import { callFirebaseFunction } from '../../../../utilities/firebase/functions'
import useFirebase from '../../../Hooks/context/UseFirebase'

function combineDateAndTime(date: Date, time: string) {
    const options = { timeZone: 'Australia/Melbourne' }
    return moment
        .tz(`${date.toLocaleDateString('en-au', options)} ${time}`, 'DD/MM/YYYY hh:mm', 'Australia/Melbourne')
        .toDate()
}

type Props = {
    onSuccess: (date: Date) => void
}

const EventForm: React.FC<Props> = ({ onSuccess }) => {
    const classes = useStyles()
    const firebase = useFirebase()

    const [formValues, setFormValues] = useState(getEmptyFormValues())
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [success, setSuccess] = useState(false)

    useEffect(() => console.log(formValues), [formValues])

    function handleFormChange(field: keyof FormFields, e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const value = e.target.value
        setFormValues((values) => ({
            ...values,
            [field]: {
                ...values[field],
                value: value,
                error: false,
            },
        }))
    }

    function handleDateChange(date: MaterialUiPickersDate | null, _value?: string | null) {
        setFormValues((values) => ({
            ...values,
            date: {
                ...values['date'],
                value: date,
                error: false,
            },
        }))
    }

    async function handleSubmit() {
        // validation
        let hasError = false
        for (const [key, value] of Object.entries(formValues)) {
            if (key !== 'notes' && !value.value) {
                setFormValues((values) => ({
                    ...values,
                    [key]: {
                        ...values[key as keyof FormFields],
                        error: true,
                    },
                }))
                hasError = true
            }
        }
        if (hasError) return

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
            setError(true)
            setLoading(false)
        }
    }

    return (
        <>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="h6">Event Details</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <CustomTextField
                        field="contactName"
                        label="Contact name"
                        details={formValues.contactName}
                        onChange={(e) => handleFormChange('contactName', e)}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <CustomTextField
                        field="contactNumber"
                        label="Contact number"
                        details={formValues.contactNumber}
                        onChange={(e) => handleFormChange('contactNumber', e)}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <CustomTextField
                        field="contactEmail"
                        label="Contact email"
                        details={formValues.contactEmail}
                        onChange={(e) => handleFormChange('contactEmail', e)}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <CustomTextField
                        field="organisation"
                        label="Organisation / Company name"
                        details={formValues.organisation}
                        onChange={(e) => handleFormChange('organisation', e)}
                    />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <CustomTextField
                        field="location"
                        label="Location"
                        details={formValues.location}
                        onChange={(e) => handleFormChange('location', e)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6">Date & Time</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                            fullWidth
                            disableToolbar
                            variant="inline"
                            format="dd/MM/yyyy"
                            id="date"
                            label="Date of event"
                            autoOk={true}
                            value={formValues.date.value}
                            error={formValues.date.error}
                            helperText={formValues.date.error ? formValues.date.errorText : ''}
                            onChange={handleDateChange}
                            KeyboardButtonProps={{
                                'aria-label': 'change date',
                            }}
                        />
                    </MuiPickersUtilsProvider>
                </Grid>
                <Grid item xs={6} sm={4}>
                    <CustomTextField
                        field="startTime"
                        details={formValues.startTime}
                        label="Start time"
                        type="time"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        inputProps={{
                            step: 1800, // 5 min
                        }}
                        onChange={(e) => handleFormChange('startTime', e)}
                    />
                </Grid>
                <Grid item xs={6} sm={4}>
                    <CustomTextField
                        field="endTime"
                        details={formValues.endTime}
                        label="End time"
                        type="time"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        inputProps={{
                            step: 1800, // 5 min
                        }}
                        onChange={(e) => handleFormChange('endTime', e)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6">Notes</Typography>
                </Grid>
                <CustomTextField
                    field="notes"
                    label="Notes"
                    details={formValues.notes}
                    multiline
                    rows={5}
                    onChange={(e) => handleFormChange('notes', e)}
                />
            </Grid>
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

export default EventForm
