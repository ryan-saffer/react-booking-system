import {
    Button,
    FormControl,
    FormHelperText,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material'
import { Control, Controller, UseFieldArrayReturn, useFormContext } from 'react-hook-form'
import { DatePicker, TimePicker } from '@mui/x-date-pickers'

import AddIcon from '@mui/icons-material/Add'
import { DateTime } from 'luxon'
import { Event, ModuleNameMap, ObjectKeys, ScienceModule } from 'fizz-kidz'
import React from 'react'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import { capitalise } from '../../../../utilities/stringUtilities'
import { styled } from '@mui/material/styles'

const PREFIX = 'EventForm'

const classes = {
    disabled: `${PREFIX}-disabled`,
}

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')({
    [`& .${classes.disabled}`]: {
        '& .Mui-disabled': {
            color: 'rgba(0, 0, 0, 0.87)',
        },
    },
})

export type Form = {
    eventName: string
    contactName: string
    contactNumber: string
    contactEmail: string
    organisation: string
    address: string
    type: Event['type'] | ''
    module: ScienceModule | ''
    price: string
    slots: {
        startDate: DateTime | null
        startTime: DateTime | null
        endDate: DateTime | null
        endTime: DateTime | null
    }[]
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

const BaseEventForm: React.FC<NewProps | ExistingProps> = (props) => {
    const {
        control,
        formState: { errors },
        watch,
    } = useFormContext<Form>()

    const disabled = props.isNew ? false : props.disabled

    return (
        <Root>
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
                <Grid item xs={12} sm={watch('type') !== 'incursion' ? 12 : 6}>
                    <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Controller
                            name="type"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    label="type"
                                    disabled={disabled || !props.isNew}
                                    error={!!errors.type}
                                >
                                    <MenuItem value="standard">Standard</MenuItem>
                                    <MenuItem value="incursion">Incursion</MenuItem>
                                </Select>
                            )}
                        />
                        {errors.type && <FormHelperText error={true}>Type is required</FormHelperText>}
                    </FormControl>
                </Grid>
                {watch('type') === 'incursion' && (
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Module</InputLabel>
                            <Controller
                                name="module"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Select {...field} label="module" disabled={disabled} error={!!errors.module}>
                                        {ObjectKeys(ModuleNameMap).map((key) => (
                                            <MenuItem value={key} key={key}>
                                                {ModuleNameMap[key]}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                            />
                            {errors.module && <FormHelperText error={true}>Module is required</FormHelperText>}
                        </FormControl>
                    </Grid>
                )}
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
                                label="Organisation / School / Company"
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
                        name="address"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Address"
                                error={errors.address && true}
                                helperText={errors.address && 'Address is required'}
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
                                            alignItems: 'center',
                                            padding: '0px 24px',
                                            marginTop: '12px',
                                            ...(idx === 0 && { marginLeft: 20 }),
                                        }}
                                    >
                                        {idx > 0 && (
                                            <Tooltip title="Remove Slot">
                                                <IconButton
                                                    aria-label="remove slot"
                                                    onClick={() => props.fieldArray.remove(idx)}
                                                    size="small"
                                                    style={{ paddingLeft: 0 }}
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
                                        startTime: null,
                                        endDate: null,
                                        endTime: null,
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
        </Root>
    )
}

const DateTimePicker = ({
    control,
    type,
    idx,
    errors,
    helperText,
    disabled,
}: {
    type: 'start' | 'end'
    control: Control<Form, any>
    idx: number
    errors: { date: boolean; time: boolean }
    helperText: { date: string; time: string }
    disabled: boolean
}) => {
    return (
        <>
            <Grid item xs={12} sm={6} md={3}>
                <Controller
                    name={`slots.${idx}.${type}Date`}
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                        <DatePicker
                            {...field}
                            slotProps={{
                                textField: { error: errors.date, helperText: helperText.date, autoComplete: 'off' },
                            }}
                            label={`${capitalise(type)} date`}
                            disabled={disabled}
                            disablePast
                            format="dd/LL/yyyy"
                        />
                    )}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <Controller
                    name={`slots.${idx}.${type}Time`}
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                        <TimePicker
                            {...field}
                            slotProps={{
                                textField: { error: errors.time, helperText: helperText.time, autoComplete: 'off' },
                            }}
                            label={`${capitalise(type)} time`}
                            disabled={disabled}
                        />
                    )}
                />
            </Grid>
        </>
    )
}

export default BaseEventForm
