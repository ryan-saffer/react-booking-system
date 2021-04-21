import React, { useState, useContext, useMemo, FormEvent, ChangeEvent, ChangeEventHandler } from 'react'
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

import { Additions, DomainBookingFields, Locations, DomainBooking, FirestoreBooking, CakeFlavours, CreationDisplayValuesMap } from 'fizz-kidz'
import { validateFormOnChange, validateFormOnSubmit, errorFound } from '../validation'
import { capitalise } from '../../../../utilities/stringUtilities'
import WithErrorDialog, { ErrorDialogProps } from '../../../Dialogs/ErrorDialog'
import WithConfirmationDialog, { ConfirmationDialogProps } from '../../../Dialogs/ConfirmationDialog'
import Firebase, { FirebaseContext } from '../../../Firebase'
import { ExistingBookingFormFields } from './types'
import { mapFormToBooking, mapBookingToFormValues } from '../utilities'
import useAdmin from '../../../Hooks/UseAdmin'
import { isObjKey } from '../../../../utilities/typescriptUtilities'

interface ExistingBookingFormProps extends ConfirmationDialogProps, ErrorDialogProps {
    bookingId: string,
    booking: FirestoreBooking,
    onSuccess: (data: any) => void
}

const ExistingBookingForm: React.FC<ExistingBookingFormProps> = props => {

    const classes = useStyles()
    
    const { bookingId, booking } = props
    
    const firebase = useContext(FirebaseContext) as Firebase

    const isAdmin = useAdmin()

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
        setFormValues(mapBookingToFormValues(booking))
        setEditing(false)
    }

    const handleFormChange = (e: ChangeEvent<any>) => {
        if (isObjKey(e.target.name, formValues)) {
            updateFormValues(e.target.name, e.target.value)
        }
    }

    const handleFormDateChange = (date: Date | null) => {
        updateFormValues('date', date)
    }

    const handleFormCheckboxChange = (e: ChangeEvent<any>) => {
        if (isObjKey(e.target.name, formValues)) {
            updateFormValues(e.target.name, e.target.checked)
        }
    }

    function updateFormValues<K extends keyof DomainBooking>(field: K, value: string | Date | boolean | null) {

        if (value !== null) {
            let formCopy = { ...formValues }
            formCopy[field].value = value
            formCopy = validateFormOnChange(formCopy, field, value) as ExistingBookingFormFields

            // clear the value and errors of the address field if it is no longer required
            if (field === DomainBookingFields.location && value !== 'mobile') {
                formCopy.address.value = ''
                formCopy.address.error = false
            }

            setValid(!errorFound(formCopy))
            setFormValues(formCopy)
        }
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
                        id={createUniqueId(DomainBookingFields.parentFirstName, bookingId)}
                        name={DomainBookingFields.parentFirstName}
                        label="Parent first name"
                        fullWidth
                        size="small"
                        variant="outlined"
                        autoComplete='off'
                        disabled={!editing}
                        classes={{ root: classes.disabled }}
                        value={formValues[DomainBookingFields.parentFirstName].value}
                        error={formValues[DomainBookingFields.parentFirstName].error}
                        helperText={formValues[DomainBookingFields.parentFirstName].error ? formValues[DomainBookingFields.parentFirstName].errorText : ''}
                        onChange={handleFormChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        id={createUniqueId(DomainBookingFields.parentLastName, bookingId)}
                        name={DomainBookingFields.parentLastName}
                        label="Parent last name"
                        fullWidth
                        size="small"
                        variant="outlined"
                        disabled={!editing}
                        classes={{ root: classes.disabled }}
                        value={formValues[DomainBookingFields.parentLastName].value}
                        error={formValues[DomainBookingFields.parentLastName].error}
                        helperText={formValues[DomainBookingFields.parentLastName].error ? formValues[DomainBookingFields.parentLastName].errorText : ''}
                        onChange={handleFormChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        id={createUniqueId(DomainBookingFields.parentEmail, bookingId)}
                        name={DomainBookingFields.parentEmail}
                        label="Parent email"
                        fullWidth
                        size="small"
                        variant="outlined"
                        disabled={!editing}
                        classes={{ root: classes.disabled }}
                        value={formValues[DomainBookingFields.parentEmail].value}
                        error={formValues[DomainBookingFields.parentEmail].error}
                        helperText={formValues[DomainBookingFields.parentEmail].error ? formValues[DomainBookingFields.parentEmail].errorText : ''}
                        onChange={handleFormChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField
                    id={createUniqueId(DomainBookingFields.parentMobile, bookingId)}
                    name={DomainBookingFields.parentMobile}
                    label="Parent mobile"
                    fullWidth
                    size="small"
                    variant="outlined"
                    disabled={!editing}
                    classes={{ root: classes.disabled }}
                    value={formValues[DomainBookingFields.parentMobile].value}
                    error={formValues[DomainBookingFields.parentMobile].error}
                    helperText={formValues[DomainBookingFields.parentMobile].error ? formValues[DomainBookingFields.parentMobile].errorText : ''}
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
                        id={createUniqueId(DomainBookingFields.childName, bookingId)}
                        name={DomainBookingFields.childName}
                        label="Child name"
                        fullWidth
                        size="small"
                        variant="outlined"
                        disabled={!editing}
                        classes={{ root: classes.disabled }}
                        value={formValues[DomainBookingFields.childName].value}
                        error={formValues[DomainBookingFields.childName].error}
                        helperText={formValues[DomainBookingFields.childName].error ? formValues[DomainBookingFields.childName].errorText : ''}
                        onChange={handleFormChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        id={createUniqueId(DomainBookingFields.childAge, bookingId)}
                        name={DomainBookingFields.childAge}
                        label="Child age"
                        fullWidth
                        size="small"
                        variant="outlined"
                        disabled={!editing}
                        classes={{ root: classes.disabled }}
                        value={formValues[DomainBookingFields.childAge].value}
                        error={formValues[DomainBookingFields.childAge].error}
                        helperText={formValues[DomainBookingFields.childAge].error ? formValues[DomainBookingFields.childAge].errorText : ''}
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
                                id={createUniqueId(DomainBookingFields.date, bookingId)}
                                label="Date of party"
                                autoOk={true}
                                size="small"
                                disabled={!editing}
                                // classes={{ root: classes.disabled }}
                                value={formValues[DomainBookingFields.date].value}
                                error={formValues[DomainBookingFields.date].error}
                                helperText={formValues[DomainBookingFields.date].error ? formValues[DomainBookingFields.date].errorText : ''}
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
                            id={createUniqueId(DomainBookingFields.time, bookingId)}
                            name={DomainBookingFields.time}
                            label="Party time"
                            type="time"
                            size="small"
                            disabled={!editing}
                            classes={{ root: classes.disabled }}
                            value={formValues[DomainBookingFields.time].value}
                            error={formValues[DomainBookingFields.time].error}
                            helperText={formValues[DomainBookingFields.time].error ? formValues[DomainBookingFields.time].errorText : ''}
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
                                    name: DomainBookingFields.location,
                                    id: DomainBookingFields.location,
                                    value: formValues[DomainBookingFields.location].value || ''
                                }}
                                disabled={true}
                                error={formValues[DomainBookingFields.location].error}
                                onChange={handleFormChange}
                            >
                                {Object.values(Locations).map(location => (
                                    <MenuItem key={location} value={location}>{capitalise(location)}</MenuItem>
                                ))}
                            </Select>
                            {formValues.location.error ? (
                                <FormHelperText error={true}>{formValues[DomainBookingFields.location].errorText}</FormHelperText>
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
                                    name: DomainBookingFields.partyLength,
                                    id: DomainBookingFields.partyLength,
                                    value: formValues[DomainBookingFields.partyLength].value || ''
                                }}
                                disabled={!editing}
                                error={formValues[DomainBookingFields.partyLength].error}
                                onChange={handleFormChange}
                            >
                                <MenuItem value={'1'}>1 hour</MenuItem>
                                <MenuItem value={'1.5'}>1.5 hours</MenuItem>
                                <MenuItem value={'2'}>2 hours</MenuItem>
                            </Select>
                            {formValues.partyLength.error &&
                                <FormHelperText error={true}>{formValues[DomainBookingFields.partyLength].errorText}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    </>
                }
                {displayAddress &&
                    <Grid item xs={12}>
                        <TextField
                            id={createUniqueId(DomainBookingFields.address, bookingId)}
                            name={DomainBookingFields.address}
                            label="Address"
                            fullWidth
                            size="small"
                            variant="outlined"
                            disabled={!editing}
                            classes={{ root: classes.disabled }}
                            value={formValues[DomainBookingFields.address].value}
                            error={formValues[DomainBookingFields.address].error}
                            helperText={formValues[DomainBookingFields.address].error ? formValues[DomainBookingFields.address].errorText : ''}
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
                                id={createUniqueId(DomainBookingFields.numberOfChildren, bookingId)}
                                name={DomainBookingFields.numberOfChildren}
                                label="Number of children"
                                fullWidth
                                size="small"
                                variant="outlined"
                                disabled={!editing}
                                classes={{ root: classes.disabled }}
                                value={formValues[DomainBookingFields.numberOfChildren].value}
                                error={formValues[DomainBookingFields.numberOfChildren].error}
                                helperText={formValues[DomainBookingFields.numberOfChildren].error ? formValues[DomainBookingFields.numberOfChildren].errorText : ''}
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
                            id={createUniqueId(DomainBookingFields.notes, bookingId)}
                            name={DomainBookingFields.notes}
                            label="Notes"
                            fullWidth
                            size="small"
                            variant={(editing || formValues[DomainBookingFields.notes].value) ? 'outlined' : 'filled'}
                            multiline
                            disabled={!editing}
                            classes={{ root: classes.disabled }}
                            value={formValues[DomainBookingFields.notes].value}
                            error={formValues[DomainBookingFields.notes].error}
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
                            variant={formValues[DomainBookingFields.creation1].value ? 'standard' : 'filled'}
                        >
                            <InputLabel>First Creation</InputLabel>
                            <Select
                                inputProps={{
                                    name: DomainBookingFields.creation1,
                                    id: createUniqueId(DomainBookingFields.creation1, bookingId),
                                    value: formValues[DomainBookingFields.creation1].value || ''
                                }}
                                disabled={!editing}
                                error={formValues[DomainBookingFields.creation1].error}
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
                            variant={formValues[DomainBookingFields.creation2].value ? 'standard' : 'filled'}
                        >
                            <InputLabel>Second Creation</InputLabel>
                            <Select
                                inputProps={{
                                    name: DomainBookingFields.creation2,
                                    id: createUniqueId(DomainBookingFields.creation2, bookingId),
                                    value: formValues[DomainBookingFields.creation2].value || ''
                                }}
                                disabled={!editing}
                                error={formValues[DomainBookingFields.creation2].error}
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
                            variant={formValues[DomainBookingFields.creation3].value ? 'standard' : 'filled'}
                        >
                            <InputLabel>Third Creation</InputLabel>
                            <Select
                                inputProps={{
                                    name: DomainBookingFields.creation3,
                                    id: createUniqueId(DomainBookingFields.creation3, bookingId),
                                    value: formValues[DomainBookingFields.creation3].value || ''
                                }}
                                disabled={!editing || booking.partyLength !== '2'}
                                error={formValues[DomainBookingFields.creation3].error}
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
                                    id={createUniqueId(DomainBookingFields.chickenNuggets, bookingId)}
                                    color="secondary"
                                    name={DomainBookingFields.chickenNuggets}
                                    checked={formValues[DomainBookingFields.chickenNuggets].value ?? false}
                                    value={formValues[DomainBookingFields.chickenNuggets].value}
                                    disabled={!editing}
                                    onChange={handleFormCheckboxChange} />
                            }
                            label="Chicken Nuggets"
                            classes={{ root: classes.disabled }}
                        />
                    </Grid>
                    <Grid item xs={4} sm={3}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    id={createUniqueId(DomainBookingFields.fairyBread, bookingId)}
                                    color="secondary"
                                    name={DomainBookingFields.fairyBread}
                                    checked={formValues[DomainBookingFields.fairyBread].value ?? false}
                                    value={formValues[DomainBookingFields.fairyBread].value}
                                    disabled={!editing}
                                    onChange={handleFormCheckboxChange} />
                            }
                            label="Fairy Bread"
                            classes={{ root: classes.disabled }}
                        />
                    </Grid>
                    <Grid item xs={4} sm={3}>
                        <FormControlLabel
                            control={<Checkbox
                                id={createUniqueId(DomainBookingFields.fruitPlatter, bookingId)}
                                color="secondary"
                                name={DomainBookingFields.fruitPlatter}
                                checked={formValues[DomainBookingFields.fruitPlatter].value ?? false}
                                value={formValues[DomainBookingFields.fruitPlatter].value}
                                disabled={!editing}
                                onChange={handleFormCheckboxChange} />}
                            label="Fruit Platter"
                            classes={{ root: classes.disabled }}
                        />
                    </Grid>
                    <Grid item xs={4} sm={3}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    id={createUniqueId(DomainBookingFields.lollyBags, bookingId)}
                                    color="secondary"
                                    name={DomainBookingFields.lollyBags}
                                    checked={formValues[DomainBookingFields.lollyBags].value ?? false}
                                    value={formValues[DomainBookingFields.lollyBags].value}
                                    disabled={!editing}
                                    onChange={handleFormCheckboxChange} />
                            }
                            label="Lolly Bags"
                            classes={{ root: classes.disabled }}
                        />
                    </Grid>
                    <Grid item xs={4} sm={3}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    id={createUniqueId(DomainBookingFields.sandwichPlatter, bookingId)}
                                    color="secondary"
                                    name={DomainBookingFields.sandwichPlatter}
                                    checked={formValues[DomainBookingFields.sandwichPlatter].value ?? false}
                                    value={formValues[DomainBookingFields.sandwichPlatter].value}
                                    disabled={!editing}
                                    onChange={handleFormCheckboxChange} />
                            }
                            label="Sandwich Platter"
                            classes={{ root: classes.disabled }}
                        />
                    </Grid>
                    <Grid item xs={4} sm={3}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    id={createUniqueId(DomainBookingFields.veggiePlatter, bookingId)}
                                    color="secondary"
                                    name={DomainBookingFields.veggiePlatter}
                                    checked={formValues[DomainBookingFields.veggiePlatter].value ?? false}
                                    value={formValues[DomainBookingFields.veggiePlatter].value}
                                    disabled={!editing}
                                    onChange={handleFormCheckboxChange} />
                            }
                            label="Veggie Platter"
                            classes={{ root: classes.disabled }}
                        />
                    </Grid>
                    <Grid item xs={4} sm={3}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    id={createUniqueId(DomainBookingFields.watermelonPlatter, bookingId)}
                                    color="secondary"
                                    name={DomainBookingFields.watermelonPlatter}
                                    checked={formValues[DomainBookingFields.watermelonPlatter].value ?? false}
                                    value={formValues[DomainBookingFields.watermelonPlatter].value}
                                    disabled={!editing}
                                    onChange={handleFormCheckboxChange} />
                            }
                            label="Watermelon Platter"
                            classes={{ root: classes.disabled }}
                        />
                    </Grid>
                    <Grid item xs={4} sm={3}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    id={createUniqueId(DomainBookingFields.wedges, bookingId)}
                                    color="secondary"
                                    name={DomainBookingFields.wedges}
                                    checked={formValues[DomainBookingFields.wedges].value ?? false}
                                    value={formValues[DomainBookingFields.wedges].value}
                                    disabled={!editing}
                                    onChange={handleFormCheckboxChange} />
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
                            id={createUniqueId(DomainBookingFields.cake, bookingId)}
                            name={DomainBookingFields.cake}
                            label="Cake"
                            fullWidth
                            size="small"
                            variant={(editing || formValues[DomainBookingFields.cake].value) ? 'outlined' : 'filled'}
                            disabled={!editing}
                            classes={{ root: classes.disabled }}
                            value={formValues[DomainBookingFields.cake].value}
                            error={formValues[DomainBookingFields.cake].error}
                            onChange={handleFormChange}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl
                            fullWidth
                            size="small"
                            variant={formValues[DomainBookingFields.cakeFlavour].value ? 'standard' : 'filled'}
                            classes={{ root: classes.disabled }}
                        >
                            <InputLabel>Cake flavour</InputLabel>
                            <Select
                                inputProps={{
                                    name: DomainBookingFields.cakeFlavour,
                                    id: DomainBookingFields.cakeFlavour,
                                    value: formValues[DomainBookingFields.cakeFlavour].value || ''
                                }}
                                disabled={!editing}
                                error={formValues[DomainBookingFields.cakeFlavour].error}
                                onChange={e => handleFormChange(e)}
                            >
                                {Object.values(CakeFlavours).map(flavour => (
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
                            id={createUniqueId(DomainBookingFields.questions, bookingId)}
                            name={DomainBookingFields.questions}
                            label="Questions"
                            fullWidth
                            multiline
                            size="small"
                            variant={(editing || formValues[DomainBookingFields.questions].value) ? 'outlined' : 'filled'}
                            disabled={!editing}
                            classes={{ root: classes.disabled }}
                            error={formValues[DomainBookingFields.questions].error}
                            value={formValues[DomainBookingFields.questions].value}
                            onChange={handleFormChange}
                        />
                    </Grid>
                }
                {displayFunFacts &&
                    <Grid item xs={12}>
                        <TextField
                            id={createUniqueId(DomainBookingFields.funFacts, bookingId)}
                            name={DomainBookingFields.funFacts}
                            label="Fun Facts"
                            fullWidth
                            multiline
                            size="small"
                            variant={(editing || formValues[DomainBookingFields.funFacts].value) ? 'outlined' : 'filled'}
                            disabled={!editing}
                            classes={{ root: classes.disabled }}
                            error={formValues[DomainBookingFields.funFacts].error}
                            value={formValues[DomainBookingFields.funFacts].value}
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

function createUniqueId(field: string, id: string) {
    return `${field}-${id}`
}

function getCreationMenuItems() {

    // Sort the creation by their display value
    // this is particularly difficult, so first invert the CreationDisplayValues object
    // see https://stackoverflow.com/a/23013726/7870403
    const invertedCreationDisplayValues = Object.entries(CreationDisplayValuesMap).reduce(
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

export default compose<ExistingBookingFormProps, {}>(
    WithErrorDialog,
    WithConfirmationDialog
)(ExistingBookingForm)