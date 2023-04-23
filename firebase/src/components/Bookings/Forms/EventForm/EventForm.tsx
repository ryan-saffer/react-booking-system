import DateFnsUtils from '@date-io/date-fns'
import { Button, Grid, IconButton, TextField, Tooltip, Typography, makeStyles } from '@material-ui/core'
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import React from 'react'
import { Controller, useFormContext, UseFieldArrayReturn, Control } from 'react-hook-form'
import AddIcon from '@material-ui/icons/Add'
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline'
import moment from 'moment'
import { capitalise } from '../../../../utilities/stringUtilities'

export type Form = {
    eventName: string
    contactName: string
    contactNumber: string
    contactEmail: string
    organisation: string
    location: string
    price: string
    slots: { startDate: Date | null; startTime: string; endDate: Date | null; endTime: string }[]
    notes: string
}

type NewProps = {
    isNew: true
    fieldArray: UseFieldArrayReturn<Form, 'slots', 'id'>
}

type ExistingProps = {
    isNew: false
    disabled: boolean
}

const EventForm: React.FC<NewProps | ExistingProps> = (props) => {
    const classes = useStyles()

    const {
        control,
        formState: { errors },
    } = useFormContext<Form>()

    const disabled = props.isNew ? false : props.disabled

    return (
        <>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="h6">Event Details</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Controller
                        name="eventName"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                error={errors.eventName ? true : false}
                                helperText={errors.eventName && 'Event name is required'}
                                label="Event name"
                                fullWidth
                                variant="outlined"
                                autoComplete="off"
                                disabled={disabled}
                                classes={{ root: classes.disabled }}
                            />
                        )}
                    />
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
                                disabled={disabled}
                                classes={{ root: classes.disabled }}
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
                                disabled={disabled}
                                classes={{ root: classes.disabled }}
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
                                disabled={disabled}
                                classes={{ root: classes.disabled }}
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
                                disabled={disabled}
                                classes={{ root: classes.disabled }}
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
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
                                disabled={disabled}
                                classes={{ root: classes.disabled }}
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Controller
                        name="price"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Price"
                                error={errors.price && true}
                                helperText={errors.price && 'Price is required'}
                                fullWidth
                                variant="outlined"
                                autoComplete="off"
                                disabled={disabled}
                                classes={{ root: classes.disabled }}
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6">Date & Time</Typography>
                </Grid>
                {props.isNew && (
                    <>
                        {props.fieldArray.fields.map((slot, idx) => (
                            <React.Fragment key={slot.id}>
                                {props.fieldArray.fields.length > 1 && (
                                    <Grid
                                        item
                                        xs={12}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-end',
                                            padding: '0px 12px',
                                        }}
                                    >
                                        {idx > 0 && (
                                            <Tooltip title="Remove Slot">
                                                <IconButton
                                                    aria-label="remove slot"
                                                    onClick={() => props.fieldArray.remove(idx)}
                                                    size="small"
                                                >
                                                    <RemoveCircleOutlineIcon fontSize="inherit" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <Typography variant="subtitle2" align="center">{`Slot ${idx + 1}`}</Typography>
                                    </Grid>
                                )}
                                <DateTimePicker
                                    type="start"
                                    control={control}
                                    idx={idx}
                                    id={slot.id}
                                    errors={{
                                        date: errors.slots?.[idx]?.startDate ? true : false,
                                        time: errors.slots?.[idx]?.startTime ? true : false,
                                    }}
                                    helperText={{
                                        date: errors.slots?.[idx]?.startDate ? 'Start date is required' : '',
                                        time: errors.slots?.[idx]?.startTime ? 'Start time is required' : '',
                                    }}
                                    disabled={disabled}
                                />
                                <DateTimePicker
                                    type="end"
                                    control={control}
                                    idx={idx}
                                    id={slot.id}
                                    errors={{
                                        date: errors.slots?.[idx]?.endDate ? true : false,
                                        time: errors.slots?.[idx]?.endTime ? true : false,
                                    }}
                                    helperText={{
                                        date: errors.slots?.[idx]?.endDate ? 'End date is required' : '',
                                        time: errors.slots?.[idx]?.endTime ? 'End time is required' : '',
                                    }}
                                    disabled={disabled}
                                />
                            </React.Fragment>
                        ))}
                        <Grid item xs={12}>
                            <Button
                                variant="outlined"
                                endIcon={<AddIcon />}
                                fullWidth
                                onClick={() =>
                                    props.fieldArray.append({
                                        startDate: null,
                                        startTime: '',
                                        endDate: null,
                                        endTime: '',
                                    })
                                }
                            >
                                Add slot
                            </Button>
                        </Grid>
                    </>
                )}
                {!props.isNew && (
                    <>
                        <DateTimePicker
                            type="start"
                            control={control}
                            idx={0}
                            id="startDate"
                            errors={{
                                date: errors.slots?.[0]?.startDate ? true : false,
                                time: errors.slots?.[0]?.startTime ? true : false,
                            }}
                            helperText={{
                                date: errors.slots?.[0]?.startDate ? 'Start date is required' : '',
                                time: errors.slots?.[0]?.startTime ? 'Start time is required' : '',
                            }}
                            disabled={disabled}
                        />
                        <DateTimePicker
                            type="end"
                            control={control}
                            idx={0}
                            id="endTime"
                            errors={{
                                date: errors.slots?.[0]?.endDate ? true : false,
                                time: errors.slots?.[0]?.endTime ? true : false,
                            }}
                            helperText={{
                                date: errors.slots?.[0]?.endDate ? 'End date is required' : '',
                                time: errors.slots?.[0]?.endTime ? 'End time is required' : '',
                            }}
                            disabled={disabled}
                        />
                    </>
                )}
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
                                placeholder="These are only for us to view."
                                multiline
                                rows={5}
                                fullWidth
                                variant="outlined"
                                autoComplete="off"
                                disabled={disabled}
                                classes={{ root: classes.disabled }}
                            />
                        )}
                    />
                </Grid>
            </Grid>
        </>
    )
}

const DateTimePicker = ({
    control,
    type,
    idx,
    id,
    errors,
    helperText,
    disabled,
}: {
    type: 'start' | 'end'
    control: Control<Form, any>
    idx: number
    id: string
    errors: { date: boolean; time: boolean }
    helperText: { date: string; time: string }
    disabled: boolean
}) => {
    const classes = useStyles()
    return (
        <>
            <Grid item xs={12} sm={6} md={3}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <Controller
                        name={`slots.${idx}.${type}Date`}
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
                                id={`${type}Date-${id}`}
                                label={`${capitalise(type)} date`}
                                autoOk={true}
                                error={errors.date}
                                helperText={helperText.date}
                                KeyboardButtonProps={{
                                    'aria-label': 'change date',
                                }}
                                disabled={disabled}
                                className={classes.disabled}
                            />
                        )}
                    />
                </MuiPickersUtilsProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <Controller
                    name={`slots.${idx}.${type}Time`}
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            error={errors.time}
                            helperText={helperText.time}
                            label={`${capitalise(type)} time`}
                            fullWidth
                            variant="outlined"
                            autoComplete="off"
                            id={`${type}Time-${id}`}
                            type="time"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                step: 1800, // 5 min
                            }}
                            disabled={disabled}
                            classes={{ root: classes.disabled }}
                        />
                    )}
                />
            </Grid>
        </>
    )
}

export function combineDateAndTime(date: Date, time: string) {
    const options = { timeZone: 'Australia/Melbourne' }
    return moment
        .tz(`${date.toLocaleDateString('en-au', options)} ${time}`, 'DD/MM/YYYY hh:mm', 'Australia/Melbourne')
        .toDate()
}

const useStyles = makeStyles({
    disabled: {
        '& .Mui-disabled': {
            color: 'rgba(0, 0, 0, 0.87)',
        },
    },
})

export default EventForm
