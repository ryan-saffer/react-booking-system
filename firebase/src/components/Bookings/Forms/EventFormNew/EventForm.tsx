import DateFnsUtils from '@date-io/date-fns'
import { Button, Grid, IconButton, TextField, Typography } from '@material-ui/core'
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import React from 'react'
import { Controller, useFormContext, UseFieldArrayReturn } from 'react-hook-form'
import { Form } from './NewEventForm'
import AddIcon from '@material-ui/icons/Add'
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline'
import moment from 'moment'

type Props = {
    fieldArray: UseFieldArrayReturn<Form, 'slots', 'id'>
}

export function combineDateAndTime(date: Date, time: string) {
    const options = { timeZone: 'Australia/Melbourne' }
    return moment
        .tz(`${date.toLocaleDateString('en-au', options)} ${time}`, 'DD/MM/YYYY hh:mm', 'Australia/Melbourne')
        .toDate()
}

const EventForm: React.FC<Props> = ({ fieldArray }) => {
    const {
        control,
        formState: { errors },
    } = useFormContext<Form>()

    return (
        <>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="h6">Event Details</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Controller
                        name="contactName"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                error={errors.contactName ? true : false}
                                helperText={errors.contactName && 'Contact name is required'}
                                label="Contact name"
                                fullWidth
                                variant="outlined"
                                autoComplete="off"
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Controller
                        name="contactNumber"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                error={errors.contactNumber && true}
                                helperText={errors.contactNumber && 'Contact number is required'}
                                label="Contact number"
                                fullWidth
                                variant="outlined"
                                autoComplete="off"
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Controller
                        name="contactEmail"
                        control={control}
                        rules={{
                            required: true,
                            pattern: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
                        }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                error={errors.contactEmail && true}
                                helperText={
                                    errors.contactEmail && errors.contactEmail.type === 'pattern'
                                        ? 'Email is not valid'
                                        : errors.contactEmail?.type === 'required'
                                        ? 'Contact email is required'
                                        : ''
                                }
                                label="Contact email"
                                fullWidth
                                variant="outlined"
                                autoComplete="off"
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Controller
                        name="organisation"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Organisation / Company name"
                                error={errors.organisation && true}
                                helperText={errors.organisation && 'Organisation is required'}
                                fullWidth
                                variant="outlined"
                                autoComplete="off"
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Controller
                        name="location"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Location"
                                error={errors.location && true}
                                helperText={errors.location && 'Location is required'}
                                fullWidth
                                variant="outlined"
                                autoComplete="off"
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6">Date & Time</Typography>
                </Grid>
                {fieldArray.fields.map((slot, idx) => (
                    <React.Fragment key={slot.id}>
                        {fieldArray.fields.length > 1 && (
                            <Grid
                                item
                                xs={12}
                                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0 }}
                            >
                                <Typography variant="subtitle2" align="center">{`Slot ${idx + 1}`}</Typography>
                                {idx > 0 && (
                                    <IconButton
                                        aria-label="remove slot"
                                        onClick={() => fieldArray.remove(idx)}
                                        size="small"
                                    >
                                        <RemoveCircleOutlineIcon fontSize="inherit" />
                                    </IconButton>
                                )}
                            </Grid>
                        )}
                        <Grid item xs={12} sm={6} md={3}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <Controller
                                    name={`slots.${idx}.startDate`}
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { onChange, value } }) => (
                                        <KeyboardDatePicker
                                            onChange={onChange}
                                            value={value}
                                            fullWidth
                                            disableToolbar
                                            variant="inline"
                                            format="dd/MM/yyyy"
                                            id={`startDate-${slot.id}`}
                                            label="Date of event"
                                            autoOk={true}
                                            error={errors.slots?.[idx]?.startDate && true}
                                            helperText={errors.slots?.[idx]?.startDate && 'Start date is required'}
                                            KeyboardButtonProps={{
                                                'aria-label': 'change date',
                                            }}
                                        />
                                    )}
                                />
                            </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Controller
                                name={`slots.${idx}.startTime`}
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        error={errors.slots?.[idx]?.startTime && true}
                                        helperText={errors.slots?.[idx]?.startTime && 'Start time is required'}
                                        label="Start time"
                                        fullWidth
                                        variant="outlined"
                                        autoComplete="off"
                                        type="time"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        inputProps={{
                                            step: 1800, // 5 min
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <Controller
                                    name={`slots.${idx}.endDate`}
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { onChange, value } }) => (
                                        <KeyboardDatePicker
                                            onChange={onChange}
                                            value={value}
                                            fullWidth
                                            disableToolbar
                                            variant="inline"
                                            format="dd/MM/yyyy"
                                            id={`endDate-${slot.id}`}
                                            label="End date of event"
                                            autoOk={true}
                                            error={errors.slots?.[idx]?.endDate && true}
                                            helperText={errors.slots?.[idx]?.endDate && 'End date is required'}
                                            KeyboardButtonProps={{
                                                'aria-label': 'change date',
                                            }}
                                        />
                                    )}
                                />
                            </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Controller
                                name={`slots.${idx}.endTime`}
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        error={errors.slots?.[idx]?.endTime && true}
                                        helperText={errors.slots?.[idx]?.endTime && 'End time is required'}
                                        label="End time"
                                        fullWidth
                                        variant="outlined"
                                        autoComplete="off"
                                        type="time"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        inputProps={{
                                            step: 1800, // 5 min
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                    </React.Fragment>
                ))}
                <Grid item xs={12}>
                    <Button
                        variant="outlined"
                        endIcon={<AddIcon />}
                        fullWidth
                        onClick={() =>
                            fieldArray.append({ startDate: null, startTime: '', endDate: null, endTime: '' })
                        }
                    >
                        Add slot
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6">Notes</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Controller
                        name="notes"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Notes"
                                multiline
                                rows={5}
                                fullWidth
                                variant="outlined"
                                autoComplete="off"
                            />
                        )}
                    />
                </Grid>
            </Grid>
        </>
    )
}

export default EventForm
