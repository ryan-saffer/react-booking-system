import React, { useState } from 'react'
import { withFirebase } from '../../Firebase'
import 'typeface-roboto'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns'
import { InputLabel, MenuItem, FormHelperText, FormControlLabel, Checkbox, Button } from '@material-ui/core'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import SaveIcon from '@material-ui/icons/Save'
import CheckIcon from '@material-ui/icons/Check'
import CreateIcon from '@material-ui/icons/Create'
import DeleteIcon from '@material-ui/icons/Delete'
import CircularProgress from '@material-ui/core/CircularProgress'
import Fab from '@material-ui/core/Fab'
import { green, red } from '@material-ui/core/colors'
import { validateFormOnChange, validateFormOnSubmit, errorFound } from '../validation'
import { additions, creations, creationDisplayValues, fields, cakeFlavours, locations } from '../../../constants/formValues'
import { capitalise } from '../../../utilities'
import { compose } from 'recompose'
import withErrorDialog from '../../Dialogs/ErrorDialog'
import withConfirmationDialog from '../../Dialogs/ConfirmationDialog'

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
        backgroundColor: red[400],
        "&:hover": {
            backgroundColor: red[800]
        }
    },
    progress: {
        color: green[500],
        position: 'absolute',
        marginTop: '18px',
        marginLeft: '6px'
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
    }
}))

/** Function, not const obj, to avoid mutation. Each call returns an empty form. */
const getEmptyValues = () => (
    {
        [fields.PARENT_FIRST_NAME]: {
            value: '',
            error: false,
            errorText: 'First name cannot be empty'
        },
        [fields.PARENT_LAST_NAME]: {
            value: '',
            error: false,
            errorText: 'Last name cannot be empty'
        },
        [fields.PARENT_EMAIL]: {
            value: '',
            error: false,
            errorText: "Email address cannot be empty"
        },
        [fields.PARENT_MOBILE]: {
            value: '',
            error: false,
            errorText: 'Mobile number cannot be empty'
        },
        [fields.CHILD_NAME]: {
            value: '',
            error: false,
            errorText: 'Child name cannot be empty'
        },
        [fields.CHILD_AGE]: {
            value: '',
            error: false,
            errorText: 'Child age cannot be empty'
        },
        [fields.DATE]: {
            value: null,
            error: false,
            errorText: 'Date cannot be empty'
        },
        [fields.TIME]: {
            value: '',
            error: false,
            errorText: 'Time cannot be empty'
        },
        [fields.LOCATION]: {
            value: '',
            error: false,
            errorText: 'Location cannot be empty'
        },
        [fields.PARTY_LENGTH]: {
            value: '',
            error: false,
            errorText: 'Party length cannot be empty'
        },
        [fields.ADDRESS]: {
            value: '',
            error: false,
            errorText: 'Address cannot be empty'
        },
        [fields.NOTES]: {
            value: '',
            error: false,
            errorText: ''
        },
        [fields.CREATION_1]: {
            value: '',
            error: false,
            errorText: ''
        },
        [fields.CREATION_2]: {
            value: '',
            error: false,
            errorText: ''
        },
        [fields.CREATION_3]: {
            value: '',
            error: false,
            errorText: ''
        },
        [additions.CHICKEN_NUGGETS]: {
            value: false,
            error: false,
            errorText: ''
        },
        [additions.FAIRY_BREAD]: {
            value: false,
            error: false,
            errorText: ''
        },
        [additions.FRUIT_PLATTER]: {
            value: false,
            error: false,
            errorText: ''
        },
        [additions.LOLLY_BAGS]: {
            value: false,
            error: false,
            errorText: ''
        },
        [additions.SANDWICH_PLATTER]: {
            value: false,
            error: false,
            errorText: ''
        },
        [additions.VEGGIE_PLATTER]: {
            value: false,
            error: false,
            errorText: ''
        },
        [additions.WATERMELON_PLATTER]: {
            value: false,
            error: false,
            errorText: ''
        },
        [additions.WEDGES]: {
            value: false,
            error: false,
            errorText: ''
        },
        [fields.CAKE]: {
            value: '',
            error: false,
            errorText: ''
        },
        [fields.CAKE_FLAVOUR]: {
            value: '',
            error: false,
            errorText: ''
        },
        [fields.QUESTIONS]: {
            value: '',
            error: false,
            errorText: ''
        }
    }
)

/**
 * Strips out the error and errorText fields, leaving only the field and value
 * 
 * @param {object} formValues - the form values as an object
 * @return {object} the booking ready to be written to firestore
 */
const mapFormToBooking = formValues => {

    var booking = {}
    for (let field in formValues) {
        booking[field] = formValues[field].value
    }

    // combine date and time into one
    var isoString = `${booking.date.toISOString().split('T')[0]}T${booking.time}:00+11:00`
    var dateTime = new Date(isoString)
    delete booking.date
    delete booking.time
    booking['dateTime'] = dateTime

    return booking
}

function mapBookingToFormValues(booking) {
    var tmpFormValues = getEmptyValues()

    for (let field in tmpFormValues) {
        const val = booking[field]
        if (val !== undefined) {
            tmpFormValues[field].value = val
        }
    }

    const dateTime = booking.dateTime.toDate()
    tmpFormValues[fields.DATE].value = dateTime
    tmpFormValues[fields.TIME].value = dateFormat(dateTime, "HH:MM")

    return tmpFormValues
}

const ExistingBookingForm = props => {

    const classes = useStyles()

    const { firebase, bookingId, booking } = props

    const initialValues = booking ? mapBookingToFormValues(booking) : getEmptyValues

    const [formValues, setFormValues] = useState(initialValues)
    const [valid, setValid] = useState(true)
    const [editing, setEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleEdit = () => {
        setEditing(true)
    }

    const cancelEdit = () => {
        setFormValues(mapBookingToFormValues(booking))
        setEditing(false)
    }

    const handleFormChange = e => {
        const isDateField = e instanceof Date
        let field = isDateField ? 'date' : e.target.name
        let value
        if (isDateField) {
            value = e
        } else if (Object.values(additions).includes(field)) { // checkboxes
            value = e.target.checked
        } else {
            value = e.target.value
        }
        let tmpValues = { ...formValues }
        tmpValues[field].value = value
        tmpValues = validateFormOnChange(tmpValues, field, value)

        // clear the value and errors of the address field if it is no longer required
        if (field === fields.LOCATION && value !== 'mobile') {
            tmpValues[fields.ADDRESS].value = ''
            tmpValues[fields.ADDRESS].error = false
        }

        setValid(!errorFound(tmpValues))
        setFormValues(tmpValues)
    }

    const handleSubmit = () => {

        var tmpFormValues = { ...formValues }
        tmpFormValues = validateFormOnSubmit(tmpFormValues)
        // if there is an error (fields are empty), update the values and return
        if (tmpFormValues) {
            setValid(false)
            setFormValues(tmpFormValues)
            return
        }

        // everything looks good, lets write to firebase and create calendar/send confirmation email
        setLoading(true)
        var bookingCopy = { ...booking }
        delete bookingCopy.dateTime // dateTime is handled in the mapping, and do not want it overriden in below merge
        var mergedBooking = { ...bookingCopy, ...mapFormToBooking(formValues) }

        firebase.functions.httpsCallable('updateBooking')({
            auth: firebase.auth.currentUser.toJSON(),
            data: JSON.stringify({bookingId: bookingId, booking: mergedBooking})
        }).then(result => {
            console.log(result.data)
            setLoading(false)
            setSuccess(true)
            setTimeout(() => { // let user see success for a second, then refesh
                setEditing(false)
                setSuccess(false)
                props.onSuccess(formValues[fields.DATE].value)
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
            auth: firebase.auth.currentUser.toJSON(),
            data: { bookingId, booking }
        }).then(result => {
            console.log(result.data)
            setLoading(false)
            setSuccess(true)
            setTimeout(() => { // let user see success for a second, then refesh
                setEditing(false)
                setSuccess(false)
                props.onSuccess(formValues[fields.DATE].value)
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
                        id={fields.PARENT_FIRST_NAME}
                        name={fields.PARENT_FIRST_NAME}
                        label="Parent first name"
                        fullWidth
                        variant="outlined"
                        autoComplete='off'
                        disabled={!editing}
                        value={formValues[fields.PARENT_FIRST_NAME].value}
                        error={formValues[fields.PARENT_FIRST_NAME].error}
                        helperText={formValues[fields.PARENT_FIRST_NAME].error ? formValues[fields.PARENT_FIRST_NAME].errorText : ''}
                        onChange={handleFormChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        id={fields.PARENT_LAST_NAME}
                        name={fields.PARENT_LAST_NAME}
                        label="Parent last name"
                        fullWidth
                        variant="outlined"
                        disabled={!editing}
                        value={formValues[fields.PARENT_LAST_NAME].value}
                        error={formValues[fields.PARENT_LAST_NAME].error}
                        helperText={formValues[fields.PARENT_LAST_NAME].error ? formValues[fields.PARENT_LAST_NAME].errorText : ''}
                        onChange={handleFormChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        id={fields.PARENT_EMAIL}
                        name={fields.PARENT_EMAIL}
                        label="Parent email"
                        fullWidth
                        variant="outlined"
                        disabled={!editing}
                        value={formValues[fields.PARENT_EMAIL].value}
                        error={formValues[fields.PARENT_EMAIL].error}
                        helperText={formValues[fields.PARENT_EMAIL].error ? formValues[fields.PARENT_EMAIL].errorText : ''}
                        onChange={handleFormChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField
                    id={fields.PARENT_MOBILE}
                    name={fields.PARENT_MOBILE}
                    label="Parent mobile"
                    fullWidth
                    variant="outlined"
                    disabled={!editing}
                    value={formValues[fields.PARENT_MOBILE].value}
                    error={formValues[fields.PARENT_MOBILE].error}
                    helperText={formValues[fields.PARENT_MOBILE].error ? formValues[fields.PARENT_MOBILE].errorText : ''}
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
                        id={fields.CHILD_NAME}
                        name={fields.CHILD_NAME}
                        label="Child name"
                        fullWidth
                        variant="outlined"
                        disabled={!editing}
                        value={formValues[fields.CHILD_NAME].value}
                        error={formValues[fields.CHILD_NAME].error}
                        helperText={formValues[fields.CHILD_NAME].error ? formValues[fields.CHILD_NAME].errorText : ''}
                        onChange={handleFormChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        id={fields.CHILD_AGE}
                        name={fields.CHILD_AGE}
                        label="Child age"
                        fullWidth
                        variant="outlined"
                        disabled={!editing}
                        value={formValues[fields.CHILD_AGE].value}
                        error={formValues[fields.CHILD_AGE].error}
                        helperText={formValues[fields.CHILD_AGE].error ? formValues[fields.CHILD_AGE].errorText : ''}
                        onChange={handleFormChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6">
                        Date, time & location
                    </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                            fullWidth
                            disableToolbar
                            variant="inline"
                            format="dd/MM/yyyy"
                            id={fields.DATE}
                            label="Date of party"
                            autoOk="true"
                            disabled={!editing}
                            value={formValues[fields.DATE].value}
                            error={formValues[fields.DATE].error}
                            helperText={formValues[fields.DATE].error ? formValues[fields.DATE].errorText : ''}
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
                        id={fields.TIME}
                        name={fields.TIME}
                        label="Party time"
                        type="time"
                        disabled={!editing}
                        value={formValues[fields.TIME].value}
                        error={formValues[fields.TIME].error}
                        helperText={formValues[fields.TIME].error ? formValues[fields.TIME].errorText : ''}
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
                    >
                    <InputLabel>Location</InputLabel>
                        <Select
                            inputProps={{
                                name: fields.LOCATION,
                                id: fields.LOCATION,
                                value: formValues[fields.LOCATION].value || ''
                            }}
                            disabled={true}
                            error={formValues[fields.LOCATION].error}
                            onChange={handleFormChange}
                        >
                            {Object.values(locations).map(location => (
                                <MenuItem key={location} value={location}>{capitalise(location)}</MenuItem>
                            ))}
                    </Select>
                    {formValues.location.error ? (
                        <FormHelperText error={true}>{formValues[fields.LOCATION].errorText}</FormHelperText>
                    ) : null}
                    </FormControl>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <FormControl
                        fullWidth
                    >
                        <InputLabel>Party length</InputLabel>
                        <Select
                            inputProps={{
                                name: fields.PARTY_LENGTH,
                                id: fields.PARTY_LENGTH,
                                value: formValues[fields.PARTY_LENGTH].value || ''
                            }}
                            disabled={!editing}
                            error={formValues[fields.PARTY_LENGTH].error}
                            onChange={handleFormChange}
                        >
                            <MenuItem value={'1'}>1 hour</MenuItem>
                            <MenuItem value={'1.5'}>1.5 hours</MenuItem>
                            <MenuItem value={'2'}>2 hours</MenuItem>
                    </Select>
                    {formValues.partyLength.error &&
                        <FormHelperText error={true}>{formValues[fields.PARTY_LENGTH].errorText}</FormHelperText>}
                    </FormControl>
                </Grid>
                {formValues.location.value === 'mobile' &&
                    <Grid item xs={12}>
                        <TextField
                            id={fields.ADDRESS}
                            name={fields.ADDRESS}
                            label="Address"
                            fullWidth
                            variant="outlined"
                            disabled={!editing}
                            value={formValues[fields.ADDRESS].value}
                            error={formValues[fields.ADDRESS].error}
                            helperText={formValues[fields.ADDRESS].error ? formValues[fields.ADDRESS].errorText : ''}
                            onChange={handleFormChange}
                        />
                    </Grid>}
                <Grid item xs={12}>
                    <Typography variant="h6">
                        Notes
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        id={fields.NOTES}
                        name={fields.NOTES}
                        label="Notes"
                        fullWidth
                        variant="outlined"
                        multiline
                        disabled={!editing}
                        value={formValues[fields.NOTES].value}
                        error={formValues[fields.NOTES].error}
                        onChange={handleFormChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6">
                        Creations
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormControl
                        fullWidth
                    >
                        <InputLabel>First Creation</InputLabel>
                        <Select
                            inputProps={{
                                name: fields.CREATION_1,
                                id: fields.CREATION_1,
                                value: formValues[fields.CREATION_1].value || ''
                            }}
                            disabled={!editing}
                            error={formValues[fields.CREATION_1].error}
                            onChange={handleFormChange}
                        >
                            {Object.values(creations).map(creation => (
                                <MenuItem key={creation} value={creation}>{creationDisplayValues[creation]}</MenuItem>
                            ))}
                    </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormControl
                        fullWidth
                    >
                        <InputLabel>Second Creation</InputLabel>
                        <Select
                            inputProps={{
                                name: fields.CREATION_2,
                                id: fields.CREATION_2,
                                value: formValues[fields.CREATION_2].value || ''
                            }}
                            disabled={!editing}
                            error={formValues[fields.CREATION_2].error}
                            onChange={handleFormChange}
                        >
                            {Object.values(creations).map(creation => (
                                <MenuItem key={creation} value={creation}>{creationDisplayValues[creation]}</MenuItem>
                            ))}
                    </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormControl
                        fullWidth
                    >
                        <InputLabel>Third Creation</InputLabel>
                        <Select
                            inputProps={{
                                name: fields.CREATION_3,
                                id: fields.CREATION_3,
                                value: formValues[fields.CREATION_3].value || ''
                            }}
                            disabled={!editing || booking.partyLength !== '2'}
                            error={formValues[fields.CREATION_3].error}
                            onChange={handleFormChange}
                        >
                            {Object.values(creations).map(creation => (
                                <MenuItem key={creation} value={creation}>{creationDisplayValues[creation]}</MenuItem>
                            ))}
                    </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6">
                        Additions
                    </Typography>
                </Grid>
                <Grid item xs={4} sm={3}>
                    <FormControlLabel
                        control={<Checkbox
                                    id={additions.CHICKEN_NUGGETS}
                                    color="secondary"
                                    name={additions.CHICKEN_NUGGETS}
                                    checked={formValues[additions.CHICKEN_NUGGETS].value}
                                    value={formValues[additions.CHICKEN_NUGGETS].value}
                                    disabled={!editing}
                                    onChange={handleFormChange} />}
                        label="Chicken Nuggets"
                    />
                </Grid>
                <Grid item xs={4} sm={3}>
                    <FormControlLabel
                        control={<Checkbox
                                    id={additions.FAIRY_BREAD}
                                    color="secondary"
                                    name={additions.FAIRY_BREAD}
                                    checked={formValues[additions.FAIRY_BREAD].value}
                                    value={formValues[additions.FAIRY_BREAD].value}
                                    disabled={!editing}
                                    onChange={handleFormChange} />}
                        label="Fairy Bread"
                    />
                </Grid>
                <Grid item xs={4} sm={3}>
                    <FormControlLabel
                        control={<Checkbox
                                    id={additions.FRUIT_PLATTER}
                                    color="secondary"
                                    name={additions.FRUIT_PLATTER}
                                    checked={formValues[additions.FRUIT_PLATTER].value}
                                    value={formValues[additions.FRUIT_PLATTER].value}
                                    disabled={!editing}
                                    onChange={handleFormChange} />}
                        label="Fruit Platter"
                    />
                </Grid>
                <Grid item xs={4} sm={3}>
                    <FormControlLabel
                        control={<Checkbox
                                    id={additions.LOLLY_BAGS}
                                    color="secondary"
                                    name={additions.LOLLY_BAGS}
                                    checked={formValues[additions.LOLLY_BAGS].value}
                                    value={formValues[additions.LOLLY_BAGS].value}
                                    disabled={!editing}
                                    onChange={handleFormChange} />}
                        label="Lolly Bags"
                    />
                </Grid>
                <Grid item xs={4} sm={3}>
                    <FormControlLabel
                        control={<Checkbox
                                    id={additions.SANDWICH_PLATTER}
                                    color="secondary"
                                    name={additions.SANDWICH_PLATTER}
                                    checked={formValues[additions.SANDWICH_PLATTER].value}
                                    value={formValues[additions.SANDWICH_PLATTER].value}
                                    disabled={!editing}
                                    onChange={handleFormChange} />}
                        label="Sandwich Platter"
                    />
                </Grid>
                <Grid item xs={4} sm={3}>
                    <FormControlLabel
                        control={<Checkbox
                                    id={additions.VEGGIE_PLATTER}
                                    color="secondary"
                                    name={additions.VEGGIE_PLATTER}
                                    checked={formValues[additions.VEGGIE_PLATTER].value}
                                    value={formValues[additions.VEGGIE_PLATTER].value}
                                    disabled={!editing}
                                    onChange={handleFormChange} />}
                        label="Veggie Platter"
                    />
                </Grid>
                <Grid item xs={4} sm={3}>
                    <FormControlLabel
                        control={<Checkbox
                                    id={additions.WATERMELON_PLATTER}
                                    color="secondary"
                                    name={additions.WATERMELON_PLATTER}
                                    checked={formValues[additions.WATERMELON_PLATTER].value}
                                    value={formValues[additions.WATERMELON_PLATTER].value}
                                    disabled={!editing}
                                    onChange={handleFormChange} />}
                        label="Watermelon Platter"
                    />
                </Grid>
                <Grid item xs={4} sm={3}>
                    <FormControlLabel
                        control={<Checkbox
                                    id={additions.WEDGES}
                                    color="secondary"
                                    name={additions.WEDGES}
                                    checked={formValues[additions.WEDGES].value}
                                    value={formValues[additions.WEDGES].value}
                                    disabled={!editing}
                                    onChange={handleFormChange} />}
                        label="Wedges"
                    />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6">
                        Cake
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        id={fields.CAKE}
                        name={fields.CAKE}
                        label="Cake"
                        fullWidth
                        variant="outlined"
                        disabled={!editing}
                        value={formValues[fields.CAKE].value}
                        error={formValues[fields.CAKE].error}
                        onChange={handleFormChange}
                    />
                </Grid>
                <Grid item xs={6}>
                    <FormControl
                        fullWidth
                    >
                        <InputLabel>Cake flavour</InputLabel>
                        <Select
                            inputProps={{
                                name: fields.CAKE_FLAVOUR,
                                id: fields.CAKE_FLAVOUR,
                                value: formValues[fields.CAKE_FLAVOUR].value || ''
                            }}
                            disabled={!editing}
                            error={formValues[fields.CAKE_FLAVOUR].error}
                            onChange={handleFormChange}
                        >
                            {Object.values(cakeFlavours).map(flavour => (
                                <MenuItem key={flavour} value={flavour}>{capitalise(flavour)}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6">
                        Parent Questions/Comments
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        id={fields.QUESTIONS}
                        name={fields.QUESTIONS}
                        label="Questions"
                        fullWidth
                        variant="outlined"
                        disabled={!editing}
                        error={formValues[fields.QUESTIONS].error}
                        value={formValues[fields.QUESTIONS].value}
                        onChange={handleFormChange}
                    />
                </Grid>
            </Grid>
            <div className={classes.saveButtonDiv}>
                {!loading && !editing &&
                    <Fab
                        className={classes.deleteButton}
                        aria-label="delete"
                        onClick={e => {
                            props.showConfirmationDialog({
                                title: "Delete Booking",
                                message: "Are you sure you want to delete this booking?",
                                confirmButton: "Delete",
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
                        color="primary"
                        type="submit"
                        disabled={loading}
                        onClick={handleEdit}
                    >
                        {<CreateIcon />}
                    </Fab>
                )}
                {loading && <CircularProgress size={68} className={classes.progress} />}
            </div>
        </>
    )
}

export default compose(
    withErrorDialog,
    withConfirmationDialog,
    withFirebase
)(ExistingBookingForm)