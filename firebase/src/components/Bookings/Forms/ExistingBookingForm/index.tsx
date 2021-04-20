import React, { useState, useContext, useEffect, useMemo } from 'react'
import 'typeface-roboto'
import { compose } from 'recompose'
import DateFnsUtils from '@date-io/date-fns'
import { makeStyles, Grid, Typography, TextField, InputLabel, MenuItem, FormHelperText, FormControlLabel,
Select, CircularProgress, Fab, Checkbox, Button, FormControl } from '@material-ui/core'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import SaveIcon from '@material-ui/icons/Save'
import CheckIcon from '@material-ui/icons/Check'
import CreateIcon from '@material-ui/icons/Create'
import DeleteIcon from '@material-ui/icons/Delete'
import { green, red } from '@material-ui/core/colors'

import { Bookings } from 'fizz-kidz'
import { validateFormOnChange, validateFormOnSubmit, errorFound } from '../validation'
import { capitalise } from '../../../../utilities/stringUtilities'
import WithErrorDialog, { ErrorDialogProps } from '../../../Dialogs/ErrorDialog'
import WithConfirmationDialog, { ConfirmationDialogProps } from '../../../Dialogs/ConfirmationDialog'
import Firebase, { FirebaseContext } from '../../../Firebase'
import { ExistingBookingFormFields } from './types'
import { mapFormToBooking, mapBookingToFormValues, getEmptyValues } from '../utilities'
import useAdmin from '../../../Hooks/UseAdmin'

type BookingFields = keyof Bookings.DomainBooking

const dateFormat = require('dateformat')

const useStyles = makeStyles(theme => ({
    saveButtonDiv: {
        display: 'flex',
        justifyContent: 'flex-end'
    },
    saveButton: {
        marginTop: theme.spacing(3)
    },
    deleteButton: {
        marginTop: theme.spacing(3),
        marginRight: theme.spacing(3),
        "&:hover": {
            backgroundColor: red[800]
        }
    },
    progress: {
        color: green[500],
        position: 'absolute',
        marginTop: '18px',
        marginRight: '-6px'
    },
    success: {
        marginTop: theme.spacing(3),
        backgroundColor: green[500]
    },
    editButton: {
        marginTop: theme.spacing(3)
    },
    cancelButton: {
        marginTop: theme.spacing(3),
        marginRight: theme.spacing(3)
    },
    disabled: {
        "& .Mui-disabled": {
            color: "rgba(0, 0, 0, 0.87)"
        }
    }
}))

function createUniqueId(field: any, id: any) {
    return `${field}-${id}`
}

function getCreationMenuItems() {

    // Sort the creation by their display value
    // this is particularly difficult, so first invert the CreationDisplayValues object
    // see https://stackoverflow.com/a/23013726/7870403
    const invertedCreationDisplayValues = Object.entries(Bookings.CreationDisplayValuesMap).reduce(
        (ret: { [key: string]: any }, entry) => {
            const [key, value] = entry;
            ret[value] = key;
            return ret;
        },
        {}
    );

    // then sort it by key
    const creationDisplayValues = Object.keys(invertedCreationDisplayValues)
    creationDisplayValues.sort()

    // then add each creation back into a new object one by one, now that it is sorted
    const sortedCreations: { [key: string]: any } = {}
    creationDisplayValues.forEach(value => {
        const creation = invertedCreationDisplayValues[value]
        sortedCreations[creation] = value
    })

    // and finally return them as menu items
    return Object.keys(sortedCreations).map(creation => (
        <MenuItem key={creation} value={creation}>{sortedCreations[creation]}</MenuItem>
    ))
}

interface ExistingBookingFormProps extends ConfirmationDialogProps, ErrorDialogProps {
    bookingId: string,
    booking: Bookings.FirestoreBooking,
    onSuccess: (data: any) => void
}

const ExistingBookingForm: React.FC<ExistingBookingFormProps> = props => {

    const classes = useStyles()
    
    const { bookingId, booking } = props
    
    const firebase = useContext(FirebaseContext) as Firebase

    const isAdmin = useAdmin()

    console.log(`rendering existing booking form for:`, booking)
    const bookingAsForm = useMemo(() => mapBookingToFormValues(booking), [])
    const [formValues, setFormValues] = useState<ExistingBookingFormFields>(bookingAsForm)

    const [valid, setValid] = useState(true)
    const [editing, setEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    
    const displayAddress = formValues.location.value === "mobile"
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
    for (let addition of Object.values(Bookings.Addition)) {
        if (formValues[addition].value) {
            additionSelected = true
        }
    }
    const displayAdditions = additionSelected || editing

    const handleEdit = () => {
        setEditing(true)
    }

    const cancelEdit = () => {
        setFormValues(mapBookingToFormValues(booking))
        setEditing(false)
    }

    const handleFormChange = (e: any) => {
        const isDateField = e instanceof Date
        let field = isDateField ? 'date' : e.target.name
        console.log('field', field)
        let value
        if (isDateField) {
            value = e
        } else if (Object.keys(Bookings.Addition).includes(field)) { // checkboxes
            value = e.target.checked
        } else {
            value = e.target.value
        }
        let tmpValues = { ...formValues }
        tmpValues[field].value = value
        tmpValues = validateFormOnChange(tmpValues, field, value) as ExistingBookingFormFields

        // clear the value and errors of the address field if it is no longer required
        if (field === Bookings.DomainBookingFields.location && value !== 'mobile') {
            tmpValues.address.value = ''
            tmpValues.address.error = false
        }

        setValid(!errorFound(tmpValues))
        setFormValues(formValues => ({ ...formValues, ...tmpValues }))
    }

    const handleSubmit = () => {

        var tmpFormValues = { ...formValues }
        tmpFormValues = validateFormOnSubmit(tmpFormValues) as ExistingBookingFormFields
        // if there is an error (fields are empty), update the values and return
        if (tmpFormValues) {
            setValid(false)
            setFormValues(tmpFormValues)
            return
        }

        // everything looks good, lets write to firebase and create calendar/send confirmation email
        setLoading(true)
        // var bookingCopy = { ...booking }
        // delete bookingCopy.dateTime // dateTime is handled in the mapping, and do not want it overriden in below merge
        // var mergedBooking = { ...bookingCopy, ...mapFormToBooking(booking) }
        const booking = mapFormToBooking(formValues)

        firebase.functions.httpsCallable('updateBooking')({
            auth: firebase.auth.currentUser?.toJSON(),
            data: JSON.stringify({bookingId: bookingId, booking: booking})
        }).then(result => {
            console.log(result.data)
            setLoading(false)
            setSuccess(true)
            setTimeout(() => { // let user see success for a second, then refesh
                setEditing(false)
                setSuccess(false)
                props.onSuccess(formValues.date.value)
            }, 1000)
        }).catch(err => {
            console.log(err)
            setLoading(false)
            setSuccess(false)
            props.displayError("Unable to update the booking. Please try again.\nError details: " + err)
        }).finally(() => {
            console.log('finally')
        })
    }

    const handleDeleteBooking = () => {
        setLoading(true)
        firebase.functions.httpsCallable('deleteBooking')({
            auth: firebase.auth.currentUser?.toJSON(),
            data: { bookingId, booking }
        }).then(result => {
            console.log(result.data)
            setLoading(false)
            setSuccess(true)
            setTimeout(() => { // let user see success for a second, then refesh
                setEditing(false)
                setSuccess(false)
                props.onSuccess(formValues.date.value)
            }, 1000)
        }).catch(err => {
            console.log(err)
            setLoading(false)
            setSuccess(false)
            props.displayError("Unable to delete the booking. Please try again.\nError details: " + err)
        }).finally(() => {
            console.log('finally')
        })
    }

    return (
        <>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="h6">
                        Parent details
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        id={createUniqueId(Bookings.DomainBookingFields.parentFirstName, bookingId)}
                        name={Bookings.DomainBookingFields.parentFirstName}
                        label="Parent first name"
                        fullWidth
                        size="small"
                        variant="outlined"
                        autoComplete='off'
                        disabled={!editing}
                        classes={{ root: classes.disabled }}
                        value={formValues[Bookings.DomainBookingFields.parentFirstName].value}
                        error={formValues[Bookings.DomainBookingFields.parentFirstName].error}
                        helperText={formValues[Bookings.DomainBookingFields.parentFirstName].error ? formValues[Bookings.DomainBookingFields.parentFirstName].errorText : ''}
                        onChange={handleFormChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        id={createUniqueId(Bookings.DomainBookingFields.parentLastName, bookingId)}
                        name={Bookings.DomainBookingFields.parentLastName}
                        label="Parent last name"
                        fullWidth
                        size="small"
                        variant="outlined"
                        disabled={!editing}
                        classes={{ root: classes.disabled }}
                        value={formValues[Bookings.DomainBookingFields.parentLastName].value}
                        error={formValues[Bookings.DomainBookingFields.parentLastName].error}
                        helperText={formValues[Bookings.DomainBookingFields.parentLastName].error ? formValues[Bookings.DomainBookingFields.parentLastName].errorText : ''}
                        onChange={handleFormChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        id={createUniqueId(Bookings.DomainBookingFields.parentEmail, bookingId)}
                        name={Bookings.DomainBookingFields.parentEmail}
                        label="Parent email"
                        fullWidth
                        size="small"
                        variant="outlined"
                        disabled={!editing}
                        classes={{ root: classes.disabled }}
                        value={formValues[Bookings.DomainBookingFields.parentEmail].value}
                        error={formValues[Bookings.DomainBookingFields.parentEmail].error}
                        helperText={formValues[Bookings.DomainBookingFields.parentEmail].error ? formValues[Bookings.DomainBookingFields.parentEmail].errorText : ''}
                        onChange={handleFormChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField
                    id={createUniqueId(Bookings.DomainBookingFields.parentMobile, bookingId)}
                    name={Bookings.DomainBookingFields.parentMobile}
                    label="Parent mobile"
                    fullWidth
                    size="small"
                    variant="outlined"
                    disabled={!editing}
                    classes={{ root: classes.disabled }}
                    value={formValues[Bookings.DomainBookingFields.parentMobile].value}
                    error={formValues[Bookings.DomainBookingFields.parentMobile].error}
                    helperText={formValues[Bookings.DomainBookingFields.parentMobile].error ? formValues[Bookings.DomainBookingFields.parentMobile].errorText : ''}
                    onChange={handleFormChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6">
                        Child details
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        id={createUniqueId(Bookings.DomainBookingFields.childName, bookingId)}
                        name={Bookings.DomainBookingFields.childName}
                        label="Child name"
                        fullWidth
                        size="small"
                        variant="outlined"
                        disabled={!editing}
                        classes={{ root: classes.disabled }}
                        value={formValues[Bookings.DomainBookingFields.childName].value}
                        error={formValues[Bookings.DomainBookingFields.childName].error}
                        helperText={formValues[Bookings.DomainBookingFields.childName].error ? formValues[Bookings.DomainBookingFields.childName].errorText : ''}
                        onChange={handleFormChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        id={createUniqueId(Bookings.DomainBookingFields.childAge, bookingId)}
                        name={Bookings.DomainBookingFields.childAge}
                        label="Child age"
                        fullWidth
                        size="small"
                        variant="outlined"
                        disabled={!editing}
                        classes={{ root: classes.disabled }}
                        value={formValues[Bookings.DomainBookingFields.childAge].value}
                        error={formValues[Bookings.DomainBookingFields.childAge].error}
                        helperText={formValues[Bookings.DomainBookingFields.childAge].error ? formValues[Bookings.DomainBookingFields.childAge].errorText : ''}
                        onChange={handleFormChange}
                    />
                </Grid>
                {displayDateTimeLocationHeading &&
                    <Grid item xs={12}>
                        <Typography variant="h6">
                            Date, time & location
                        </Typography>
                    </Grid>
                }
                {displayDateTimeLocation &&
                    <>
                    <Grid item xs={6} sm={3}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                                fullWidth
                                disableToolbar
                                variant="inline"
                                format="dd/MM/yyyy"
                                id={createUniqueId(Bookings.DomainBookingFields.date, bookingId)}
                                label="Date of party"
                                autoOk={true}
                                size="small"
                                disabled={!editing}
                                // classes={{ root: classes.disabled }}
                                value={formValues[Bookings.DomainBookingFields.date].value}
                                error={formValues[Bookings.DomainBookingFields.date].error}
                                helperText={formValues[Bookings.DomainBookingFields.date].error ? formValues[Bookings.DomainBookingFields.date].errorText : ''}
                                onChange={handleFormChange}
                                KeyboardButtonProps={{
                                    'aria-label': 'change date',
                                }}
                            />
                        </MuiPickersUtilsProvider>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            fullWidth
                            id={createUniqueId(Bookings.DomainBookingFields.time, bookingId)}
                            name={Bookings.DomainBookingFields.time}
                            label="Party time"
                            type="time"
                            size="small"
                            disabled={!editing}
                            classes={{ root: classes.disabled }}
                            value={formValues[Bookings.DomainBookingFields.time].value}
                            error={formValues[Bookings.DomainBookingFields.time].error}
                            helperText={formValues[Bookings.DomainBookingFields.time].error ? formValues[Bookings.DomainBookingFields.time].errorText : ''}
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
                        <FormControl
                            fullWidth
                            size="small"
                            classes={{ root: classes.disabled }}
                        >
                            <InputLabel>Location</InputLabel>
                            <Select
                                inputProps={{
                                    name: Bookings.DomainBookingFields.location,
                                    id: Bookings.DomainBookingFields.location,
                                    value: formValues[Bookings.DomainBookingFields.location].value || ''
                                }}
                                disabled={true}
                                error={formValues[Bookings.DomainBookingFields.location].error}
                                onChange={handleFormChange}
                            >
                                {Object.values(Bookings.Location).map(location => (
                                    <MenuItem key={location} value={location}>{capitalise(location)}</MenuItem>
                                ))}
                            </Select>
                            {formValues.location.error ? (
                                <FormHelperText error={true}>{formValues[Bookings.DomainBookingFields.location].errorText}</FormHelperText>
                            ) : null}
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <FormControl
                            fullWidth
                            size="small"
                            classes={{ root: classes.disabled }}
                        >
                            <InputLabel>Party length</InputLabel>
                            <Select
                                inputProps={{
                                    name: Bookings.DomainBookingFields.partyLength,
                                    id: Bookings.DomainBookingFields.partyLength,
                                    value: formValues[Bookings.DomainBookingFields.partyLength].value || ''
                                }}
                                disabled={!editing}
                                error={formValues[Bookings.DomainBookingFields.partyLength].error}
                                onChange={handleFormChange}
                            >
                                <MenuItem value={'1'}>1 hour</MenuItem>
                                <MenuItem value={'1.5'}>1.5 hours</MenuItem>
                                <MenuItem value={'2'}>2 hours</MenuItem>
                            </Select>
                            {formValues.partyLength.error &&
                                <FormHelperText error={true}>{formValues[Bookings.DomainBookingFields.partyLength].errorText}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    </>
                }
                {displayAddress &&
                    <Grid item xs={12}>
                        <TextField
                            id={createUniqueId(Bookings.DomainBookingFields.address, bookingId)}
                            name={Bookings.DomainBookingFields.address}
                            label="Address"
                            fullWidth
                            size="small"
                            variant="outlined"
                            disabled={!editing}
                            classes={{ root: classes.disabled }}
                            value={formValues[Bookings.DomainBookingFields.address].value}
                            error={formValues[Bookings.DomainBookingFields.address].error}
                            helperText={formValues[Bookings.DomainBookingFields.address].error ? formValues[Bookings.DomainBookingFields.address].errorText : ''}
                            onChange={handleFormChange}
                        />
                    </Grid>
                }
                {displayNumberOfChildren &&
                    <>
                    <Grid item xs={12}>
                        <Typography variant="h6">
                                Number of children
                        </Typography>
                    </Grid>
                        <Grid item xs={12}>
                            <TextField
                                id={createUniqueId(Bookings.DomainBookingFields.numberOfChildren, bookingId)}
                                name={Bookings.DomainBookingFields.numberOfChildren}
                                label="Number of children"
                                fullWidth
                                size="small"
                                variant="outlined"
                                disabled={!editing}
                                classes={{ root: classes.disabled }}
                                value={formValues[Bookings.DomainBookingFields.numberOfChildren].value}
                                error={formValues[Bookings.DomainBookingFields.numberOfChildren].error}
                                helperText={formValues[Bookings.DomainBookingFields.numberOfChildren].error ? formValues[Bookings.DomainBookingFields.numberOfChildren].errorText : ''}
                                onChange={handleFormChange}
                            />
                        </Grid>
                    </>
                }
                {displayNotes &&
                    <>
                    <Grid item xs={12}>
                        <Typography variant="h6">
                            Notes
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            id={createUniqueId(Bookings.DomainBookingFields.notes, bookingId)}
                            name={Bookings.DomainBookingFields.notes}
                            label="Notes"
                            fullWidth
                            size="small"
                            variant={(editing || formValues[Bookings.DomainBookingFields.notes].value) ? 'outlined' : 'filled'}
                            multiline
                            disabled={!editing}
                            classes={{ root: classes.disabled }}
                            value={formValues[Bookings.DomainBookingFields.notes].value}
                            error={formValues[Bookings.DomainBookingFields.notes].error}
                            onChange={handleFormChange}
                        />
                    </Grid>
                    </>
                }
                {displayCreationHeading &&
                    <Grid item xs={12}>
                        <Typography variant="h6">
                            Creations
                        </Typography>
                    </Grid>
                }
                {displayCreation1 &&
                    <Grid item xs={12} sm={4}>
                        <FormControl
                            fullWidth
                            size="small"
                            classes={{ root: classes.disabled }}
                            variant={formValues[Bookings.DomainBookingFields.creation1].value ? 'standard' : 'filled'}
                        >
                            <InputLabel>First Creation</InputLabel>
                            <Select
                                inputProps={{
                                    name: Bookings.DomainBookingFields.creation1,
                                    id: Bookings.DomainBookingFields.creation1,
                                    value: formValues[Bookings.DomainBookingFields.creation1].value || ''
                                }}
                                disabled={!editing}
                                error={formValues[Bookings.DomainBookingFields.creation1].error}
                                onChange={handleFormChange}
                            >
                                {getCreationMenuItems()}
                            </Select>
                        </FormControl>
                    </Grid>
                }
                {displayCreation2 &&
                    <Grid item xs={12} sm={4}>
                        <FormControl
                            fullWidth
                            size="small"
                            classes={{ root: classes.disabled }}
                            variant={formValues[Bookings.DomainBookingFields.creation2].value ? 'standard' : 'filled'}
                        >
                            <InputLabel>Second Creation</InputLabel>
                            <Select
                                inputProps={{
                                    name: Bookings.DomainBookingFields.creation2,
                                    id: Bookings.DomainBookingFields.creation2,
                                    value: formValues[Bookings.DomainBookingFields.creation2].value || ''
                                }}
                                disabled={!editing}
                                error={formValues[Bookings.DomainBookingFields.creation2].error}
                                onChange={handleFormChange}
                            >
                                {getCreationMenuItems()}
                            </Select>
                        </FormControl>
                    </Grid>
                }
                {displayCreation3 &&
                    <Grid item xs={12} sm={4}>
                        <FormControl
                            fullWidth
                            size="small"
                            classes={{ root: classes.disabled }}
                            variant={formValues[Bookings.DomainBookingFields.creation3].value ? 'standard' : 'filled'}
                        >
                            <InputLabel>Third Creation</InputLabel>
                            <Select
                                inputProps={{
                                    name: Bookings.DomainBookingFields.creation3,
                                    id: Bookings.DomainBookingFields.creation3,
                                    value: formValues[Bookings.DomainBookingFields.creation3].value || ''
                                }}
                                disabled={!editing || booking.partyLength !== '2'}
                                error={formValues[Bookings.DomainBookingFields.creation3].error}
                                onChange={handleFormChange}
                            >
                                {getCreationMenuItems()}
                            </Select>
                        </FormControl>
                    </Grid>
                }
                {displayAdditions &&
                    <>
                    <Grid item xs={12}>
                        <Typography variant="h6">
                            Additions
                        </Typography>
                    </Grid>
                    <Grid item xs={4} sm={3}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    id={createUniqueId(Bookings.DomainBookingFields.chickenNuggets, bookingId)}
                                    color="secondary"
                                    name={Bookings.DomainBookingFields.chickenNuggets}
                                    checked={formValues[Bookings.DomainBookingFields.chickenNuggets].value ?? false}
                                    value={formValues[Bookings.DomainBookingFields.chickenNuggets].value}
                                    disabled={!editing}
                                    onChange={handleFormChange} />
                            }
                            label="Chicken Nuggets"
                            classes={{ root: classes.disabled }}
                        />
                    </Grid>
                    <Grid item xs={4} sm={3}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    id={createUniqueId(Bookings.DomainBookingFields.fairyBread, bookingId)}
                                    color="secondary"
                                    name={Bookings.DomainBookingFields.fairyBread}
                                    checked={formValues[Bookings.DomainBookingFields.fairyBread].value ?? false}
                                    value={formValues[Bookings.DomainBookingFields.fairyBread].value}
                                    disabled={!editing}
                                    onChange={handleFormChange} />
                            }
                            label="Fairy Bread"
                            classes={{ root: classes.disabled }}
                        />
                    </Grid>
                    <Grid item xs={4} sm={3}>
                        <FormControlLabel
                            control={<Checkbox
                                id={createUniqueId(Bookings.DomainBookingFields.fruitPlatter, bookingId)}
                                color="secondary"
                                name={Bookings.DomainBookingFields.fruitPlatter}
                                checked={formValues[Bookings.DomainBookingFields.fruitPlatter].value ?? false}
                                value={formValues[Bookings.DomainBookingFields.fruitPlatter].value}
                                disabled={!editing}
                                onChange={handleFormChange} />}
                            label="Fruit Platter"
                            classes={{ root: classes.disabled }}
                        />
                    </Grid>
                    <Grid item xs={4} sm={3}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    id={createUniqueId(Bookings.DomainBookingFields.lollyBags, bookingId)}
                                    color="secondary"
                                    name={Bookings.DomainBookingFields.lollyBags}
                                    checked={formValues[Bookings.DomainBookingFields.lollyBags].value ?? false}
                                    value={formValues[Bookings.DomainBookingFields.lollyBags].value}
                                    disabled={!editing}
                                    onChange={handleFormChange} />
                            }
                            label="Lolly Bags"
                            classes={{ root: classes.disabled }}
                        />
                    </Grid>
                    <Grid item xs={4} sm={3}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    id={createUniqueId(Bookings.DomainBookingFields.sandwichPlatter, bookingId)}
                                    color="secondary"
                                    name={Bookings.DomainBookingFields.sandwichPlatter}
                                    checked={formValues[Bookings.DomainBookingFields.sandwichPlatter].value ?? false}
                                    value={formValues[Bookings.DomainBookingFields.sandwichPlatter].value}
                                    disabled={!editing}
                                    onChange={handleFormChange} />
                            }
                            label="Sandwich Platter"
                            classes={{ root: classes.disabled }}
                        />
                    </Grid>
                    <Grid item xs={4} sm={3}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    id={createUniqueId(Bookings.DomainBookingFields.veggiePlatter, bookingId)}
                                    color="secondary"
                                    name={Bookings.DomainBookingFields.veggiePlatter}
                                    checked={formValues[Bookings.DomainBookingFields.veggiePlatter].value ?? false}
                                    value={formValues[Bookings.DomainBookingFields.veggiePlatter].value}
                                    disabled={!editing}
                                    onChange={handleFormChange} />
                            }
                            label="Veggie Platter"
                            classes={{ root: classes.disabled }}
                        />
                    </Grid>
                    <Grid item xs={4} sm={3}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    id={createUniqueId(Bookings.DomainBookingFields.watermelonPlatter, bookingId)}
                                    color="secondary"
                                    name={Bookings.DomainBookingFields.watermelonPlatter}
                                    checked={formValues[Bookings.DomainBookingFields.watermelonPlatter].value ?? false}
                                    value={formValues[Bookings.DomainBookingFields.watermelonPlatter].value}
                                    disabled={!editing}
                                    onChange={handleFormChange} />
                            }
                            label="Watermelon Platter"
                            classes={{ root: classes.disabled }}
                        />
                    </Grid>
                    <Grid item xs={4} sm={3}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    id={createUniqueId(Bookings.DomainBookingFields.wedges, bookingId)}
                                    color="secondary"
                                    name={Bookings.DomainBookingFields.wedges}
                                    checked={formValues[Bookings.DomainBookingFields.wedges].value ?? false}
                                    value={formValues[Bookings.DomainBookingFields.wedges].value}
                                    disabled={!editing}
                                    onChange={handleFormChange} />
                            }
                            label="Wedges"
                            classes={{ root: classes.disabled }}
                        />
                    </Grid>
                    </>
                }
                {displayCake &&
                    <>
                    <Grid item xs={12}>
                        <Typography variant="h6">
                            Cake
                    </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            id={createUniqueId(Bookings.DomainBookingFields.cake, bookingId)}
                            name={Bookings.DomainBookingFields.cake}
                            label="Cake"
                            fullWidth
                            size="small"
                            variant={(editing || formValues[Bookings.DomainBookingFields.cake].value) ? 'outlined' : 'filled'}
                            disabled={!editing}
                            classes={{ root: classes.disabled }}
                            value={formValues[Bookings.DomainBookingFields.cake].value}
                            error={formValues[Bookings.DomainBookingFields.cake].error}
                            onChange={handleFormChange}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl
                            fullWidth
                            size="small"
                            variant={formValues[Bookings.DomainBookingFields.cakeFlavour].value ? 'standard' : 'filled'}
                            classes={{ root: classes.disabled }}
                        >
                            <InputLabel>Cake flavour</InputLabel>
                            <Select
                                inputProps={{
                                    name: Bookings.DomainBookingFields.cakeFlavour,
                                    id: Bookings.DomainBookingFields.cakeFlavour,
                                    value: formValues[Bookings.DomainBookingFields.cakeFlavour].value || ''
                                }}
                                disabled={!editing}
                                error={formValues[Bookings.DomainBookingFields.cakeFlavour].error}
                                onChange={handleFormChange}
                            >
                                {Object.values(Bookings.CakeFlavour).map(flavour => (
                                    <MenuItem key={flavour} value={flavour}>{capitalise(flavour)}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    </>
                }
                {displayQuestionsCommentsFunFactsHeading &&
                    <Grid item xs={12}>
                        <Typography variant="h6">
                            Parent Questions  / Comments / Fun Facts
                        </Typography>
                    </Grid>
                }
                {displayQuestions &&
                    <Grid item xs={12}>
                        <TextField
                            id={createUniqueId(Bookings.DomainBookingFields.questions, bookingId)}
                            name={Bookings.DomainBookingFields.questions}
                            label="Questions"
                            fullWidth
                            multiline
                            size="small"
                            variant={(editing || formValues[Bookings.DomainBookingFields.questions].value) ? 'outlined' : 'filled'}
                            disabled={!editing}
                            classes={{ root: classes.disabled }}
                            error={formValues[Bookings.DomainBookingFields.questions].error}
                            value={formValues[Bookings.DomainBookingFields.questions].value}
                            onChange={handleFormChange}
                        />
                    </Grid>
                }
                {displayFunFacts &&
                    <Grid item xs={12}>
                        <TextField
                            id={createUniqueId(Bookings.DomainBookingFields.funFacts, bookingId)}
                            name={Bookings.DomainBookingFields.funFacts}
                            label="Fun Facts"
                            fullWidth
                            multiline
                            size="small"
                            variant={(editing || formValues[Bookings.DomainBookingFields.funFacts].value) ? 'outlined' : 'filled'}
                            disabled={!editing}
                            classes={{ root: classes.disabled }}
                            error={formValues[Bookings.DomainBookingFields.funFacts].error}
                            value={formValues[Bookings.DomainBookingFields.funFacts].value}
                            onChange={handleFormChange}
                        />
                    </Grid>
                }
            </Grid>
            {isAdmin
                ? <div className={classes.saveButtonDiv}>
                    {!loading && !editing &&
                        <Fab
                            className={classes.deleteButton}
                            aria-label="delete"
                            color="primary"
                            onClick={e => {
                                props.showConfirmationDialog({
                                    dialogTitle: "Delete Booking",
                                    dialogContent: "Are you sure you want to delete this booking?",
                                    confirmationButtonText: "Delete",
                                    onConfirm: handleDeleteBooking
                                })
                            }}
                        >
                            <DeleteIcon />
                        </Fab>
                    }
                    {editing ? (
                        <>
                        <Button
                            className={classes.cancelButton}
                            variant="outlined"
                            onClick={cancelEdit}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Fab
                            className={success ? classes.success : classes.saveButton}
                            aria-label="save"
                            color="secondary"
                            type="submit"
                            disabled={loading || !valid}
                            onClick={handleSubmit}
                        >
                            {success ? <CheckIcon /> : <SaveIcon />}
                        </Fab>
                        </>
                    ) : (
                        <Fab
                            className={classes.editButton}
                            aria-label="edit"
                            color="secondary"
                            type="submit"
                            disabled={loading}
                            onClick={handleEdit}
                        >
                            {<CreateIcon />}
                        </Fab>
                    )}
                    {loading && <CircularProgress size={68} className={classes.progress} />}
                </div> : null
            }
        </>
    )
}

export default WithErrorDialog(WithConfirmationDialog(ExistingBookingForm))