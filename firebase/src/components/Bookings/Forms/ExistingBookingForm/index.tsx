import React, { useState, useContext, useMemo, ChangeEvent, useCallback } from 'react'
import 'typeface-roboto'
import { compose } from 'recompose'
import DateFnsUtils from '@date-io/date-fns'
import {
    makeStyles,
    Grid,
    Typography,
    TextField,
    InputLabel,
    MenuItem,
    FormHelperText,
    FormControlLabel,
    Select,
    Checkbox,
    FormControl,
} from '@material-ui/core'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'

import {
    Additions,
    FormBookingFields,
    Locations,
    FirestoreBooking,
    CakeFlavours,
    CreationDisplayValuesMap,
    FormBooking,
    Utilities,
    AdditionsDisplayValuesMap,
} from 'fizz-kidz'
import { validateFormOnChange, validateFormOnSubmit } from '../validation'
import { capitalise } from '../../../../utilities/stringUtilities'
import WithErrorDialog, { ErrorDialogProps } from '../../../Dialogs/ErrorDialog'
import WithConfirmationDialog, { ConfirmationDialogProps } from '../../../Dialogs/ConfirmationDialog'
import Firebase, { FirebaseContext } from '../../../Firebase'
import { ExistingBookingFormFields } from './types'
import { mapFormToBooking, mapFirestoreBookingToFormValues } from '../utilities'
import EditFormButtons from '../EditFormButtons'
import { useScopes } from '../../../Hooks/UseScopes'
import { callFirebaseFunction } from '../../../../utilities/firebase/functions'

interface ExistingBookingFormProps extends ConfirmationDialogProps, ErrorDialogProps {
    bookingId: string
    booking: FirestoreBooking
    onSuccess: (data: any) => void
}

const ExistingBookingForm: React.FC<ExistingBookingFormProps> = (props) => {
    const classes = useStyles()

    const { bookingId, booking } = props

    const firebase = useContext(FirebaseContext) as Firebase

    const isRestricted = useScopes().CORE === 'restricted'
    const MASK = 'xxxxx'

    const bookingAsForm = useMemo(() => mapFirestoreBookingToFormValues(booking), [booking])
    const [formValues, setFormValues] = useState<ExistingBookingFormFields>(bookingAsForm)

    const [editing, setEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const displayAddress = formValues.location.value === 'mobile'
    const displayDateTimeLocation = editing
    const displayDateTimeLocationHeading = displayDateTimeLocation || displayAddress
    const displayNumberOfChildren = formValues.numberOfChildren.value || editing
    const displayNotes = formValues.notes.value || editing
    const displayCreation1 = formValues.creation1.value || editing
    const displayCreation2 = formValues.creation2.value || editing
    const displayCreation3 = formValues.creation3.value || editing
    const displayCreationHeading = displayCreation1 || displayCreation2 || displayCreation3
    const displayCake = formValues.cake.value || editing
    const displayQuestions = formValues.questions.value || editing
    const displayFunFacts = formValues.funFacts.value || editing
    const displayQuestionsCommentsFunFactsHeading = displayQuestions || displayFunFacts
    var additionSelected = false
    for (let addition of Object.values(Additions)) {
        if (formValues[addition].value) {
            additionSelected = true
        }
    }
    const displayAdditions = additionSelected || editing

    const handleEdit = () => {
        setEditing(true)
    }

    const cancelEdit = () => {
        setFormValues(mapFirestoreBookingToFormValues(booking))
        setEditing(false)
    }

    const handleFormChange = (e: ChangeEvent<any>) => {
        if (Utilities.isObjKey(e.target.name, formValues)) {
            updateFormValues(e.target.name, e.target.value)
        }
    }

    const handleFormDateChange = (date: Date | null) => {
        updateFormValues('date', date)
    }

    const handleFormCheckboxChange = (e: ChangeEvent<any>) => {
        if (Utilities.isObjKey(e.target.name, formValues)) {
            updateFormValues(e.target.name, e.target.checked)
        }
    }

    const getCreationMenuItems = useCallback(() => {
        // Sort the creation by their display value
        // this is particularly difficult, so first invert the CreationDisplayValues object
        // see https://stackoverflow.com/a/23013726/7870403
        const invertedCreationDisplayValues = Object.entries(CreationDisplayValuesMap).reduce(
            (ret: { [key: string]: any }, entry) => {
                const [key, value] = entry
                ret[value] = key
                return ret
            },
            {}
        )

        // then sort it by key
        const creationDisplayValues = Object.keys(invertedCreationDisplayValues)
        creationDisplayValues.sort()

        // then add each creation back into a new object one by one, now that it is sorted
        const sortedCreations: { [key: string]: any } = {}
        creationDisplayValues.forEach((value) => {
            const creation = invertedCreationDisplayValues[value]
            sortedCreations[creation] = value
        })

        // and finally return them as menu items
        const creationMenuItems = Object.keys(sortedCreations).map((creation) => (
            <MenuItem key={creation} value={creation}>
                {sortedCreations[creation]}
            </MenuItem>
        ))

        return [
            <MenuItem key={''} value={''}>
                <em>None</em>
            </MenuItem>,
            ...creationMenuItems,
        ]
    }, [])

    function updateFormValues<K extends keyof FormBooking>(field: K, value: string | Date | boolean | null) {
        if (value !== null) {
            let formCopy = { ...formValues }
            const prop = formCopy[field]
            if (prop) prop.value = value
            formCopy = validateFormOnChange(formCopy, field, value) as ExistingBookingFormFields

            // clear the value and errors of the address field if it is no longer required
            if (field === FormBookingFields.location && value !== 'mobile') {
                formCopy.address.value = ''
                formCopy.address.error = false
            }

            setFormValues(formCopy)
        }
    }

    const handleSubmit = () => {
        let tmpFormValues = { ...formValues }
        tmpFormValues = validateFormOnSubmit(tmpFormValues) as ExistingBookingFormFields
        // if there is an error (fields are empty), update the values and return
        if (tmpFormValues) {
            setFormValues(tmpFormValues)
            return
        }

        // everything looks good, lets write to firebase and create calendar/send confirmation email

        // merge booking object with form values - this ensures values not inform arent deleted such as eventId
        setLoading(true)
        let bookingCopy = { ...booking }
        let mergedBooking = { ...bookingCopy, ...mapFormToBooking(formValues) }

        callFirebaseFunction(
            'updatePartyBooking',
            firebase
        )({ bookingId, booking: mergedBooking })
            .then((result) => {
                console.log(result.data)
                setLoading(false)
                setSuccess(true)
                setTimeout(() => {
                    // let user see success for a second, then refesh
                    setEditing(false)
                    setSuccess(false)
                    props.onSuccess(formValues.date.value)
                }, 1000)
            })
            .catch((err) => {
                console.log(err)
                setLoading(false)
                setSuccess(false)
                props.displayError('Unable to update the booking. Please try again.\nError details: ' + err)
            })
            .finally(() => {
                console.log('finally')
            })
    }

    const handleDeleteBooking = () => {
        setLoading(true)
        callFirebaseFunction(
            'deletePartyBooking',
            firebase
        )({ bookingId, eventId: booking.eventId!, location: booking.location })
            .then((result) => {
                console.log(result.data)
                setLoading(false)
                setSuccess(true)
                setTimeout(() => {
                    // let user see success for a second, then refesh
                    setEditing(false)
                    setSuccess(false)
                    props.onSuccess(formValues.date.value)
                }, 1000)
            })
            .catch((err) => {
                console.log(err)
                setLoading(false)
                setSuccess(false)
                props.displayError('Unable to delete the booking. Please try again.\nError details: ' + err)
            })
            .finally(() => {
                console.log('finally')
            })
    }

    const isAddition = (key: string): key is Additions => {
        return Object.keys(Additions).includes(key)
    }

    return (
        <>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="h6">Parent details</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        id={createUniqueId(FormBookingFields.parentFirstName, bookingId)}
                        name={FormBookingFields.parentFirstName}
                        label="Parent first name"
                        fullWidth
                        size="small"
                        variant="outlined"
                        autoComplete="off"
                        disabled={!editing}
                        classes={{ root: classes.disabled }}
                        value={formValues[FormBookingFields.parentFirstName].value}
                        error={formValues[FormBookingFields.parentFirstName].error}
                        helperText={
                            formValues[FormBookingFields.parentFirstName].error
                                ? formValues[FormBookingFields.parentFirstName].errorText
                                : ''
                        }
                        onChange={handleFormChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        id={createUniqueId(FormBookingFields.parentLastName, bookingId)}
                        name={FormBookingFields.parentLastName}
                        label="Parent last name"
                        fullWidth
                        size="small"
                        variant="outlined"
                        disabled={!editing}
                        classes={{ root: classes.disabled }}
                        value={isRestricted ? MASK : formValues[FormBookingFields.parentLastName].value}
                        error={formValues[FormBookingFields.parentLastName].error}
                        helperText={
                            formValues[FormBookingFields.parentLastName].error
                                ? formValues[FormBookingFields.parentLastName].errorText
                                : ''
                        }
                        onChange={handleFormChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        id={createUniqueId(FormBookingFields.parentEmail, bookingId)}
                        name={FormBookingFields.parentEmail}
                        label="Parent email"
                        fullWidth
                        size="small"
                        variant="outlined"
                        disabled={!editing}
                        classes={{ root: classes.disabled }}
                        value={isRestricted ? MASK : formValues[FormBookingFields.parentEmail].value}
                        error={formValues[FormBookingFields.parentEmail].error}
                        helperText={
                            formValues[FormBookingFields.parentEmail].error
                                ? formValues[FormBookingFields.parentEmail].errorText
                                : ''
                        }
                        onChange={handleFormChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        id={createUniqueId(FormBookingFields.parentMobile, bookingId)}
                        name={FormBookingFields.parentMobile}
                        label="Parent mobile"
                        fullWidth
                        size="small"
                        variant="outlined"
                        disabled={!editing}
                        classes={{ root: classes.disabled }}
                        value={isRestricted ? MASK : formValues[FormBookingFields.parentMobile].value}
                        error={formValues[FormBookingFields.parentMobile].error}
                        helperText={
                            formValues[FormBookingFields.parentMobile].error
                                ? formValues[FormBookingFields.parentMobile].errorText
                                : ''
                        }
                        onChange={handleFormChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6">Child details</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        id={createUniqueId(FormBookingFields.childName, bookingId)}
                        name={FormBookingFields.childName}
                        label="Child name"
                        fullWidth
                        size="small"
                        variant="outlined"
                        disabled={!editing}
                        classes={{ root: classes.disabled }}
                        value={formValues[FormBookingFields.childName].value}
                        error={formValues[FormBookingFields.childName].error}
                        helperText={
                            formValues[FormBookingFields.childName].error
                                ? formValues[FormBookingFields.childName].errorText
                                : ''
                        }
                        onChange={handleFormChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        id={createUniqueId(FormBookingFields.childAge, bookingId)}
                        name={FormBookingFields.childAge}
                        label="Child age"
                        fullWidth
                        size="small"
                        variant="outlined"
                        disabled={!editing}
                        classes={{ root: classes.disabled }}
                        value={formValues[FormBookingFields.childAge].value}
                        error={formValues[FormBookingFields.childAge].error}
                        helperText={
                            formValues[FormBookingFields.childAge].error
                                ? formValues[FormBookingFields.childAge].errorText
                                : ''
                        }
                        onChange={handleFormChange}
                    />
                </Grid>
                {displayDateTimeLocationHeading && (
                    <Grid item xs={12}>
                        <Typography variant="h6">Date, time & location</Typography>
                    </Grid>
                )}
                {displayDateTimeLocation && (
                    <>
                        <Grid item xs={6} sm={3}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                    fullWidth
                                    disableToolbar
                                    variant="inline"
                                    format="dd/MM/yyyy"
                                    id={createUniqueId(FormBookingFields.date, bookingId)}
                                    label="Date of party"
                                    autoOk={true}
                                    size="small"
                                    disabled={!editing}
                                    // classes={{ root: classes.disabled }}
                                    value={formValues[FormBookingFields.date].value}
                                    error={formValues[FormBookingFields.date].error}
                                    helperText={
                                        formValues[FormBookingFields.date].error
                                            ? formValues[FormBookingFields.date].errorText
                                            : ''
                                    }
                                    onChange={handleFormDateChange}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                    }}
                                />
                            </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth
                                id={createUniqueId(FormBookingFields.time, bookingId)}
                                name={FormBookingFields.time}
                                label="Party time"
                                type="time"
                                size="small"
                                disabled={!editing}
                                classes={{ root: classes.disabled }}
                                value={formValues[FormBookingFields.time].value}
                                error={formValues[FormBookingFields.time].error}
                                helperText={
                                    formValues[FormBookingFields.time].error
                                        ? formValues[FormBookingFields.time].errorText
                                        : ''
                                }
                                onChange={handleFormChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    step: 1800, // 5 min
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <FormControl fullWidth size="small" classes={{ root: classes.disabled }}>
                                <InputLabel>Location</InputLabel>
                                <Select
                                    inputProps={{
                                        name: FormBookingFields.location,
                                        id: FormBookingFields.location,
                                        value: formValues[FormBookingFields.location].value || '',
                                    }}
                                    disabled={true}
                                    error={formValues[FormBookingFields.location].error}
                                    onChange={handleFormChange}
                                >
                                    {Object.values(Locations).map((location) => (
                                        <MenuItem key={location} value={location}>
                                            {capitalise(location)}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formValues.location.error ? (
                                    <FormHelperText error={true}>
                                        {formValues[FormBookingFields.location].errorText}
                                    </FormHelperText>
                                ) : null}
                            </FormControl>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <FormControl fullWidth size="small" classes={{ root: classes.disabled }}>
                                <InputLabel>Party length</InputLabel>
                                <Select
                                    inputProps={{
                                        name: FormBookingFields.partyLength,
                                        id: FormBookingFields.partyLength,
                                        value: formValues[FormBookingFields.partyLength].value || '',
                                    }}
                                    disabled={!editing}
                                    error={formValues[FormBookingFields.partyLength].error}
                                    onChange={handleFormChange}
                                >
                                    <MenuItem value={'1'}>1 hour</MenuItem>
                                    <MenuItem value={'1.5'}>1.5 hours</MenuItem>
                                    <MenuItem value={'2'}>2 hours</MenuItem>
                                </Select>
                                {formValues.partyLength.error && (
                                    <FormHelperText error={true}>
                                        {formValues[FormBookingFields.partyLength].errorText}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                    </>
                )}
                {displayAddress && (
                    <Grid item xs={12}>
                        <TextField
                            id={createUniqueId(FormBookingFields.address, bookingId)}
                            name={FormBookingFields.address}
                            label="Address"
                            fullWidth
                            size="small"
                            variant="outlined"
                            disabled={!editing}
                            classes={{ root: classes.disabled }}
                            value={formValues[FormBookingFields.address].value}
                            error={formValues[FormBookingFields.address].error}
                            helperText={
                                formValues[FormBookingFields.address].error
                                    ? formValues[FormBookingFields.address].errorText
                                    : ''
                            }
                            onChange={handleFormChange}
                        />
                    </Grid>
                )}
                {displayNumberOfChildren && (
                    <>
                        <Grid item xs={12}>
                            <Typography variant="h6">Number of children</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                id={createUniqueId(FormBookingFields.numberOfChildren, bookingId)}
                                name={FormBookingFields.numberOfChildren}
                                label="Number of children"
                                fullWidth
                                size="small"
                                variant="outlined"
                                disabled={!editing}
                                classes={{ root: classes.disabled }}
                                value={formValues[FormBookingFields.numberOfChildren].value}
                                error={formValues[FormBookingFields.numberOfChildren].error}
                                helperText={
                                    formValues[FormBookingFields.numberOfChildren].error
                                        ? formValues[FormBookingFields.numberOfChildren].errorText
                                        : ''
                                }
                                onChange={handleFormChange}
                            />
                        </Grid>
                    </>
                )}
                {displayNotes && (
                    <>
                        <Grid item xs={12}>
                            <Typography variant="h6">Notes</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                id={createUniqueId(FormBookingFields.notes, bookingId)}
                                name={FormBookingFields.notes}
                                label="Notes"
                                fullWidth
                                size="small"
                                variant={editing || formValues[FormBookingFields.notes].value ? 'outlined' : 'filled'}
                                multiline
                                rows={3}
                                disabled={!editing}
                                classes={{ root: classes.disabled }}
                                value={formValues[FormBookingFields.notes].value}
                                error={formValues[FormBookingFields.notes].error}
                                onChange={handleFormChange}
                            />
                        </Grid>
                    </>
                )}
                {displayCreationHeading && (
                    <Grid item xs={12}>
                        <Typography variant="h6">Creations</Typography>
                    </Grid>
                )}
                {displayCreation1 && (
                    <Grid item xs={12} sm={4}>
                        <FormControl
                            fullWidth
                            size="small"
                            classes={{ root: classes.disabled }}
                            variant={formValues[FormBookingFields.creation1].value ? 'standard' : 'filled'}
                        >
                            <InputLabel>First Creation</InputLabel>
                            <Select
                                inputProps={{
                                    name: FormBookingFields.creation1,
                                    id: createUniqueId(FormBookingFields.creation1, bookingId),
                                    value: formValues[FormBookingFields.creation1].value || '',
                                }}
                                disabled={!editing}
                                error={formValues[FormBookingFields.creation1].error}
                                onChange={handleFormChange}
                            >
                                {getCreationMenuItems()}
                            </Select>
                        </FormControl>
                    </Grid>
                )}
                {displayCreation2 && (
                    <Grid item xs={12} sm={4}>
                        <FormControl
                            fullWidth
                            size="small"
                            classes={{ root: classes.disabled }}
                            variant={formValues[FormBookingFields.creation2].value ? 'standard' : 'filled'}
                        >
                            <InputLabel>Second Creation</InputLabel>
                            <Select
                                inputProps={{
                                    name: FormBookingFields.creation2,
                                    id: createUniqueId(FormBookingFields.creation2, bookingId),
                                    value: formValues[FormBookingFields.creation2].value || '',
                                }}
                                disabled={!editing}
                                error={formValues[FormBookingFields.creation2].error}
                                onChange={handleFormChange}
                            >
                                {getCreationMenuItems()}
                            </Select>
                        </FormControl>
                    </Grid>
                )}
                {displayCreation3 && (
                    <Grid item xs={12} sm={4}>
                        <FormControl
                            fullWidth
                            size="small"
                            classes={{ root: classes.disabled }}
                            variant={formValues[FormBookingFields.creation3].value ? 'standard' : 'filled'}
                        >
                            <InputLabel>Third Creation</InputLabel>
                            <Select
                                inputProps={{
                                    name: FormBookingFields.creation3,
                                    id: createUniqueId(FormBookingFields.creation3, bookingId),
                                    value: formValues[FormBookingFields.creation3].value || '',
                                }}
                                disabled={!editing || booking.partyLength !== '2'}
                                error={formValues[FormBookingFields.creation3].error}
                                onChange={handleFormChange}
                            >
                                {getCreationMenuItems()}
                            </Select>
                        </FormControl>
                    </Grid>
                )}
                {displayAdditions && (
                    <>
                        <Grid item xs={12}>
                            <Typography variant="h6">Additions</Typography>
                        </Grid>
                        {Object.keys(Additions).map((addition) => {
                            if (isAddition(addition)) {
                                return (
                                    <Grid item xs={6} sm={3} key={addition}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    id={createUniqueId(FormBookingFields[addition], bookingId)}
                                                    color="secondary"
                                                    name={FormBookingFields[addition]}
                                                    checked={formValues[FormBookingFields[addition]].value ?? false}
                                                    value={formValues[FormBookingFields[addition]].value}
                                                    disabled={!editing}
                                                    onChange={handleFormCheckboxChange}
                                                />
                                            }
                                            label={AdditionsDisplayValuesMap[addition]}
                                            classes={{ root: classes.disabled }}
                                        />
                                    </Grid>
                                )
                            } else return null
                        })}
                    </>
                )}
                {displayCake && (
                    <>
                        <Grid item xs={12}>
                            <Typography variant="h6">Cake</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                id={createUniqueId(FormBookingFields.cake, bookingId)}
                                name={FormBookingFields.cake}
                                label="Cake"
                                fullWidth
                                size="small"
                                variant={editing || formValues[FormBookingFields.cake].value ? 'outlined' : 'filled'}
                                disabled={!editing}
                                classes={{ root: classes.disabled }}
                                value={formValues[FormBookingFields.cake].value}
                                error={formValues[FormBookingFields.cake].error}
                                onChange={handleFormChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl
                                fullWidth
                                size="small"
                                variant={formValues[FormBookingFields.cakeFlavour].value ? 'standard' : 'filled'}
                                classes={{ root: classes.disabled }}
                            >
                                <InputLabel>Cake flavour</InputLabel>
                                <Select
                                    inputProps={{
                                        name: FormBookingFields.cakeFlavour,
                                        id: FormBookingFields.cakeFlavour,
                                        value: formValues[FormBookingFields.cakeFlavour].value || '',
                                    }}
                                    disabled={!editing}
                                    error={formValues[FormBookingFields.cakeFlavour].error}
                                    onChange={(e) => handleFormChange(e)}
                                >
                                    {Object.values(CakeFlavours).map((flavour) => (
                                        <MenuItem key={flavour} value={flavour}>
                                            {capitalise(flavour)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </>
                )}
                {displayQuestionsCommentsFunFactsHeading && (
                    <Grid item xs={12}>
                        <Typography variant="h6">Parent Questions / Comments / Fun Facts</Typography>
                    </Grid>
                )}
                {displayQuestions && (
                    <Grid item xs={12}>
                        <TextField
                            id={createUniqueId(FormBookingFields.questions, bookingId)}
                            name={FormBookingFields.questions}
                            label="Questions"
                            fullWidth
                            multiline
                            size="small"
                            variant={editing || formValues[FormBookingFields.questions].value ? 'outlined' : 'filled'}
                            disabled={!editing}
                            classes={{ root: classes.disabled }}
                            error={formValues[FormBookingFields.questions].error}
                            value={formValues[FormBookingFields.questions].value}
                            onChange={handleFormChange}
                        />
                    </Grid>
                )}
                {displayFunFacts && (
                    <Grid item xs={12}>
                        <TextField
                            id={createUniqueId(FormBookingFields.funFacts, bookingId)}
                            name={FormBookingFields.funFacts}
                            label="Fun Facts"
                            fullWidth
                            multiline
                            size="small"
                            variant={editing || formValues[FormBookingFields.funFacts].value ? 'outlined' : 'filled'}
                            disabled={!editing}
                            classes={{ root: classes.disabled }}
                            error={formValues[FormBookingFields.funFacts].error}
                            value={formValues[FormBookingFields.funFacts].value}
                            onChange={handleFormChange}
                        />
                    </Grid>
                )}
            </Grid>
            <EditFormButtons
                loading={loading}
                editing={editing}
                success={success}
                onStartEditing={handleEdit}
                onCancelEditing={cancelEdit}
                onDelete={() => {
                    props.showConfirmationDialog({
                        dialogTitle: 'Delete Booking',
                        dialogContent: 'Are you sure you want to delete this booking?',
                        confirmationButtonText: 'Delete',
                        onConfirm: handleDeleteBooking,
                    })
                }}
                onSave={handleSubmit}
            />
        </>
    )
}

function createUniqueId(field: string, id: string) {
    return `${field}-${id}`
}

const useStyles = makeStyles((theme) => ({
    disabled: {
        '& .Mui-disabled': {
            color: 'rgba(0, 0, 0, 0.87)',
        },
    },
}))

export default compose<ExistingBookingFormProps, {}>(WithErrorDialog, WithConfirmationDialog)(ExistingBookingForm)
