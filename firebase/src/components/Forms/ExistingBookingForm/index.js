import React, { useState, useContext } from 'react'
import moment from 'moment-timezone'
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
import { GoogleForm } from 'fizz-kidz'
import { capitalise } from '../../../utilities'
import { compose } from 'recompose'
import withErrorDialog from '../../Dialogs/ErrorDialog'
import withConfirmationDialog from '../../Dialogs/ConfirmationDialog'
import { AuthUserContext } from '../../Session'
import * as ROLES from '../../../constants/roles'

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

/** Function, not const obj, to avoid mutation. Each call returns an empty form. */
const getEmptyValues = () => (
    {
        [GoogleForm.Fields.PARENT_FIRST_NAME]: {
            value: '',
            error: false,
            errorText: 'First name cannot be empty'
        },
        [GoogleForm.Fields.PARENT_LAST_NAME]: {
            value: '',
            error: false,
            errorText: 'Last name cannot be empty'
        },
        [GoogleForm.Fields.PARENT_EMAIL]: {
            value: '',
            error: false,
            errorText: "Email address cannot be empty"
        },
        [GoogleForm.Fields.PARENT_MOBILE]: {
            value: '',
            error: false,
            errorText: 'Mobile number cannot be empty'
        },
        [GoogleForm.Fields.CHILD_NAME]: {
            value: '',
            error: false,
            errorText: 'Child name cannot be empty'
        },
        [GoogleForm.Fields.CHILD_AGE]: {
            value: '',
            error: false,
            errorText: 'Child age cannot be empty'
        },
        [GoogleForm.Fields.DATE]: {
            value: null,
            error: false,
            errorText: 'Date cannot be empty'
        },
        [GoogleForm.Fields.TIME]: {
            value: '',
            error: false,
            errorText: 'Time cannot be empty'
        },
        [GoogleForm.Fields.LOCATION]: {
            value: '',
            error: false,
            errorText: 'Location cannot be empty'
        },
        [GoogleForm.Fields.PARTY_LENGTH]: {
            value: '',
            error: false,
            errorText: 'Party length cannot be empty'
        },
        [GoogleForm.Fields.ADDRESS]: {
            value: '',
            error: false,
            errorText: 'Address cannot be empty'
        },
        [GoogleForm.Fields.NUMBER_OF_CHILDREN]: {
            value: '',
            error: false,
            errorText: ''
        },
        [GoogleForm.Fields.NOTES]: {
            value: '',
            error: false,
            errorText: ''
        },
        [GoogleForm.Fields.CREATION_1]: {
            value: '',
            error: false,
            errorText: ''
        },
        [GoogleForm.Fields.CREATION_2]: {
            value: '',
            error: false,
            errorText: ''
        },
        [GoogleForm.Fields.CREATION_3]: {
            value: '',
            error: false,
            errorText: ''
        },
        [GoogleForm.Additions.CHICKEN_NUGGETS]: {
            value: false,
            error: false,
            errorText: ''
        },
        [GoogleForm.Additions.FAIRY_BREAD]: {
            value: false,
            error: false,
            errorText: ''
        },
        [GoogleForm.Additions.FRUIT_PLATTER]: {
            value: false,
            error: false,
            errorText: ''
        },
        [GoogleForm.Additions.LOLLY_BAGS]: {
            value: false,
            error: false,
            errorText: ''
        },
        [GoogleForm.Additions.SANDWICH_PLATTER]: {
            value: false,
            error: false,
            errorText: ''
        },
        [GoogleForm.Additions.VEGGIE_PLATTER]: {
            value: false,
            error: false,
            errorText: ''
        },
        [GoogleForm.Additions.WATERMELON_PLATTER]: {
            value: false,
            error: false,
            errorText: ''
        },
        [GoogleForm.Additions.WEDGES]: {
            value: false,
            error: false,
            errorText: ''
        },
        [GoogleForm.Additions.GRAZING_PLATTER_MEDIUM]: {
            value: false,
            error: false,
            errorText: ''
        },
        [GoogleForm.Additions.GRAZING_PLATTER_LARGE]: {
            value: false,
            error: false,
            errorText: ''
        },
        [GoogleForm.Fields.CAKE]: {
            value: '',
            error: false,
            errorText: ''
        },
        [GoogleForm.Fields.CAKE_FLAVOUR]: {
            value: '',
            error: false,
            errorText: ''
        },
        [GoogleForm.Fields.QUESTIONS]: {
            value: '',
            error: false,
            errorText: ''
        },
        [GoogleForm.Fields.FUN_FACTS]: {
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

    // trim fields
    booking[GoogleForm.Fields.PARENT_FIRST_NAME] = booking[GoogleForm.Fields.PARENT_FIRST_NAME].trim()
    booking[GoogleForm.Fields.PARENT_LAST_NAME] = booking[GoogleForm.Fields.PARENT_LAST_NAME].trim()
    booking[GoogleForm.Fields.CHILD_NAME] = booking[GoogleForm.Fields.CHILD_NAME].trim()
    booking[GoogleForm.Fields.CHILD_AGE] = booking[GoogleForm.Fields.CHILD_AGE].trim()

    // combine date and time into one
    // hardcode to AEST to ensure bookings can be created/updated from anywhere in the world
    var options = { timeZone: "Australia/Melbourne" }
    var dateTime = moment.tz(
        `${booking.date.toLocaleDateString('en-au', options)} ${booking.time}}`,
        "DD/MM/YYYY hh:mm",
        "Australia/Melbourne"
    ).toDate()
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
    tmpFormValues[GoogleForm.Fields.DATE].value = dateTime
    tmpFormValues[GoogleForm.Fields.TIME].value = dateFormat(dateTime, "HH:MM")

    return tmpFormValues
}

function createUniqueId(field, id) {
    return `${field}-${id}`
}

function getCreationMenuItems() {

    // Sort the creation by their display value
    // this is particularly difficult, so first invert the CreationDisplayValues object
    // see https://stackoverflow.com/a/23013726/7870403
    const invertedCreationDisplayValues = Object.entries(GoogleForm.CreationDisplayValues).reduce((ret, entry) => {
        const [key, value] = entry;
        ret[value] = key;
        return ret;
    }, {});

    // then sort it by key
    const creationDisplayValues = Object.keys(invertedCreationDisplayValues)
    creationDisplayValues.sort()

    // then add each creation back into a new object one by one, now that it is sorted
    const sortedCreations = {}
    creationDisplayValues.forEach(value => {
        const creation = invertedCreationDisplayValues[value]
        sortedCreations[creation] = value
    })

    // and finally return them as menu items
    return Object.keys(sortedCreations).map(creation => (
        <MenuItem key={creation} value={creation}>{sortedCreations[creation]}</MenuItem>
    ))
}

const ExistingBookingForm = props => {

    const classes = useStyles()

    const { firebase, bookingId, booking } = props

    const isAdmin = useContext(AuthUserContext).roles[ROLES.ADMIN]

    const initialValues = booking ? mapBookingToFormValues(booking) : getEmptyValues

    const [formValues, setFormValues] = useState(initialValues)
    const [valid, setValid] = useState(true)
    const [editing, setEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    
    const displayAddress = formValues[GoogleForm.Fields.LOCATION].value === "mobile"
    const displayDateTimeLocation = editing
    const displayDateTimeLocationHeading = displayDateTimeLocation || displayAddress
    const displayNumberOfChildren = formValues[GoogleForm.Fields.NUMBER_OF_CHILDREN].value || editing
    const displayNotes = formValues[GoogleForm.Fields.NOTES].value || editing
    const displayCreation1 = formValues[GoogleForm.Fields.CREATION_1].value || editing
    const displayCreation2 = formValues[GoogleForm.Fields.CREATION_2].value || editing
    const displayCreation3 = formValues[GoogleForm.Fields.CREATION_3].value || editing
    const displayCreationHeading = displayCreation1 || displayCreation2 || displayCreation3
    const displayCake = formValues[GoogleForm.Fields.CAKE].value || editing
    const displayQuestions = formValues[GoogleForm.Fields.QUESTIONS].value || editing
    const displayFunFacts = formValues[GoogleForm.Fields.FUN_FACTS].value || editing
    const displayQuestionsCommentsFunFactsHeading = displayQuestions || displayFunFacts
    var additionSelected = false
    for (let addition of Object.values(GoogleForm.Additions)) {
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

    const handleFormChange = e => {
        const isDateField = e instanceof Date
        let field = isDateField ? 'date' : e.target.name
        let value
        if (isDateField) {
            value = e
        } else if (Object.values(GoogleForm.Additions).includes(field)) { // checkboxes
            value = e.target.checked
        } else {
            value = e.target.value
        }
        let tmpValues = { ...formValues }
        tmpValues[field].value = value
        tmpValues = validateFormOnChange(tmpValues, field, value)

        // clear the value and errors of the address field if it is no longer required
        if (field === GoogleForm.Fields.LOCATION && value !== 'mobile') {
            tmpValues[GoogleForm.Fields.ADDRESS].value = ''
            tmpValues[GoogleForm.Fields.ADDRESS].error = false
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
                props.onSuccess(formValues[GoogleForm.Fields.DATE].value)
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
                props.onSuccess(formValues[GoogleForm.Fields.DATE].value)
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
                        id={createUniqueId(GoogleForm.Fields.PARENT_FIRST_NAME, bookingId)}
                        name={GoogleForm.Fields.PARENT_FIRST_NAME}
                        label="Parent first name"
                        fullWidth
                        size="small"
                        variant="outlined"
                        autoComplete='off'
                        disabled={!editing}
                        classes={{ root: classes.disabled }}
                        value={formValues[GoogleForm.Fields.PARENT_FIRST_NAME].value}
                        error={formValues[GoogleForm.Fields.PARENT_FIRST_NAME].error}
                        helperText={formValues[GoogleForm.Fields.PARENT_FIRST_NAME].error ? formValues[GoogleForm.Fields.PARENT_FIRST_NAME].errorText : ''}
                        onChange={handleFormChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        id={createUniqueId(GoogleForm.Fields.PARENT_LAST_NAME, bookingId)}
                        name={GoogleForm.Fields.PARENT_LAST_NAME}
                        label="Parent last name"
                        fullWidth
                        size="small"
                        variant="outlined"
                        disabled={!editing}
                        classes={{ root: classes.disabled }}
                        value={formValues[GoogleForm.Fields.PARENT_LAST_NAME].value}
                        error={formValues[GoogleForm.Fields.PARENT_LAST_NAME].error}
                        helperText={formValues[GoogleForm.Fields.PARENT_LAST_NAME].error ? formValues[GoogleForm.Fields.PARENT_LAST_NAME].errorText : ''}
                        onChange={handleFormChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        id={createUniqueId(GoogleForm.Fields.PARENT_EMAIL, bookingId)}
                        name={GoogleForm.Fields.PARENT_EMAIL}
                        label="Parent email"
                        fullWidth
                        size="small"
                        variant="outlined"
                        disabled={!editing}
                        classes={{ root: classes.disabled }}
                        value={formValues[GoogleForm.Fields.PARENT_EMAIL].value}
                        error={formValues[GoogleForm.Fields.PARENT_EMAIL].error}
                        helperText={formValues[GoogleForm.Fields.PARENT_EMAIL].error ? formValues[GoogleForm.Fields.PARENT_EMAIL].errorText : ''}
                        onChange={handleFormChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField
                    id={createUniqueId(GoogleForm.Fields.PARENT_MOBILE, bookingId)}
                    name={GoogleForm.Fields.PARENT_MOBILE}
                    label="Parent mobile"
                    fullWidth
                    size="small"
                    variant="outlined"
                    disabled={!editing}
                    classes={{ root: classes.disabled }}
                    value={formValues[GoogleForm.Fields.PARENT_MOBILE].value}
                    error={formValues[GoogleForm.Fields.PARENT_MOBILE].error}
                    helperText={formValues[GoogleForm.Fields.PARENT_MOBILE].error ? formValues[GoogleForm.Fields.PARENT_MOBILE].errorText : ''}
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
                        id={createUniqueId(GoogleForm.Fields.CHILD_NAME, bookingId)}
                        name={GoogleForm.Fields.CHILD_NAME}
                        label="Child name"
                        fullWidth
                        size="small"
                        variant="outlined"
                        disabled={!editing}
                        classes={{ root: classes.disabled }}
                        value={formValues[GoogleForm.Fields.CHILD_NAME].value}
                        error={formValues[GoogleForm.Fields.CHILD_NAME].error}
                        helperText={formValues[GoogleForm.Fields.CHILD_NAME].error ? formValues[GoogleForm.Fields.CHILD_NAME].errorText : ''}
                        onChange={handleFormChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        id={createUniqueId(GoogleForm.Fields.CHILD_AGE, bookingId)}
                        name={GoogleForm.Fields.CHILD_AGE}
                        label="Child age"
                        fullWidth
                        size="small"
                        variant="outlined"
                        disabled={!editing}
                        classes={{ root: classes.disabled }}
                        value={formValues[GoogleForm.Fields.CHILD_AGE].value}
                        error={formValues[GoogleForm.Fields.CHILD_AGE].error}
                        helperText={formValues[GoogleForm.Fields.CHILD_AGE].error ? formValues[GoogleForm.Fields.CHILD_AGE].errorText : ''}
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
                                id={createUniqueId(GoogleForm.Fields.DATE, bookingId)}
                                label="Date of party"
                                autoOk="true"
                                size="small"
                                disabled={!editing}
                                classes={{ root: classes.disabled }}
                                value={formValues[GoogleForm.Fields.DATE].value}
                                error={formValues[GoogleForm.Fields.DATE].error}
                                helperText={formValues[GoogleForm.Fields.DATE].error ? formValues[GoogleForm.Fields.DATE].errorText : ''}
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
                            id={createUniqueId(GoogleForm.Fields.TIME, bookingId)}
                            name={GoogleForm.Fields.TIME}
                            label="Party time"
                            type="time"
                            size="small"
                            disabled={!editing}
                            classes={{ root: classes.disabled }}
                            value={formValues[GoogleForm.Fields.TIME].value}
                            error={formValues[GoogleForm.Fields.TIME].error}
                            helperText={formValues[GoogleForm.Fields.TIME].error ? formValues[GoogleForm.Fields.TIME].errorText : ''}
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
                                    name: GoogleForm.Fields.LOCATION,
                                    id: GoogleForm.Fields.LOCATION,
                                    value: formValues[GoogleForm.Fields.LOCATION].value || ''
                                }}
                                disabled={true}
                                error={formValues[GoogleForm.Fields.LOCATION].error}
                                onChange={handleFormChange}
                            >
                                {Object.values(GoogleForm.Locations).map(location => (
                                    <MenuItem key={location} value={location}>{capitalise(location)}</MenuItem>
                                ))}
                            </Select>
                            {formValues.location.error ? (
                                <FormHelperText error={true}>{formValues[GoogleForm.Fields.LOCATION].errorText}</FormHelperText>
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
                                    name: GoogleForm.Fields.PARTY_LENGTH,
                                    id: GoogleForm.Fields.PARTY_LENGTH,
                                    value: formValues[GoogleForm.Fields.PARTY_LENGTH].value || ''
                                }}
                                disabled={!editing}
                                error={formValues[GoogleForm.Fields.PARTY_LENGTH].error}
                                onChange={handleFormChange}
                            >
                                <MenuItem value={'1'}>1 hour</MenuItem>
                                <MenuItem value={'1.5'}>1.5 hours</MenuItem>
                                <MenuItem value={'2'}>2 hours</MenuItem>
                            </Select>
                            {formValues.partyLength.error &&
                                <FormHelperText error={true}>{formValues[GoogleForm.Fields.PARTY_LENGTH].errorText}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    </>
                }
                {displayAddress &&
                    <Grid item xs={12}>
                        <TextField
                            id={createUniqueId(GoogleForm.Fields.ADDRESS, bookingId)}
                            name={GoogleForm.Fields.ADDRESS}
                            label="Address"
                            fullWidth
                            size="small"
                            variant="outlined"
                            disabled={!editing}
                            classes={{ root: classes.disabled }}
                            value={formValues[GoogleForm.Fields.ADDRESS].value}
                            error={formValues[GoogleForm.Fields.ADDRESS].error}
                            helperText={formValues[GoogleForm.Fields.ADDRESS].error ? formValues[GoogleForm.Fields.ADDRESS].errorText : ''}
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
                                id={createUniqueId(GoogleForm.Fields.NUMBER_OF_CHILDREN, bookingId)}
                                name={GoogleForm.Fields.NUMBER_OF_CHILDREN}
                                label="Number of children"
                                fullWidth
                                size="small"
                                variant="outlined"
                                disabled={!editing}
                                classes={{ root: classes.disabled }}
                                value={formValues[GoogleForm.Fields.NUMBER_OF_CHILDREN].value}
                                error={formValues[GoogleForm.Fields.NUMBER_OF_CHILDREN].error}
                                helperText={formValues[GoogleForm.Fields.NUMBER_OF_CHILDREN].error ? formValues[GoogleForm.Fields.NUMBER_OF_CHILDREN].errorText : ''}
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
                            id={createUniqueId(GoogleForm.Fields.NOTES, bookingId)}
                            name={GoogleForm.Fields.NOTES}
                            label="Notes"
                            fullWidth
                            size="small"
                            variant={(editing || formValues[GoogleForm.Fields.NOTES].value) ? 'outlined' : 'filled'}
                            multiline
                            disabled={!editing}
                            classes={{ root: classes.disabled }}
                            value={formValues[GoogleForm.Fields.NOTES].value}
                            error={formValues[GoogleForm.Fields.NOTES].error}
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
                            variant={formValues[GoogleForm.Fields.CREATION_1].value ? 'standard' : 'filled'}
                        >
                            <InputLabel>First Creation</InputLabel>
                            <Select
                                inputProps={{
                                    name: GoogleForm.Fields.CREATION_1,
                                    id: GoogleForm.Fields.CREATION_1,
                                    value: formValues[GoogleForm.Fields.CREATION_1].value || ''
                                }}
                                disabled={!editing}
                                error={formValues[GoogleForm.Fields.CREATION_1].error}
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
                            variant={formValues[GoogleForm.Fields.CREATION_2].value ? 'standard' : 'filled'}
                        >
                            <InputLabel>Second Creation</InputLabel>
                            <Select
                                inputProps={{
                                    name: GoogleForm.Fields.CREATION_2,
                                    id: GoogleForm.Fields.CREATION_2,
                                    value: formValues[GoogleForm.Fields.CREATION_2].value || ''
                                }}
                                disabled={!editing}
                                error={formValues[GoogleForm.Fields.CREATION_2].error}
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
                            variant={formValues[GoogleForm.Fields.CREATION_3].value ? 'standard' : 'filled'}
                        >
                            <InputLabel>Third Creation</InputLabel>
                            <Select
                                inputProps={{
                                    name: GoogleForm.Fields.CREATION_3,
                                    id: GoogleForm.Fields.CREATION_3,
                                    value: formValues[GoogleForm.Fields.CREATION_3].value || ''
                                }}
                                disabled={!editing || booking.partyLength !== '2'}
                                error={formValues[GoogleForm.Fields.CREATION_3].error}
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
                                    id={createUniqueId(GoogleForm.Additions.CHICKEN_NUGGETS, bookingId)}
                                    color="secondary"
                                    name={GoogleForm.Additions.CHICKEN_NUGGETS}
                                    checked={formValues[GoogleForm.Additions.CHICKEN_NUGGETS].value}
                                    value={formValues[GoogleForm.Additions.CHICKEN_NUGGETS].value}
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
                                    id={createUniqueId(GoogleForm.Additions.FAIRY_BREAD, bookingId)}
                                    color="secondary"
                                    name={GoogleForm.Additions.FAIRY_BREAD}
                                    checked={formValues[GoogleForm.Additions.FAIRY_BREAD].value}
                                    value={formValues[GoogleForm.Additions.FAIRY_BREAD].value}
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
                                id={createUniqueId(GoogleForm.Additions.FRUIT_PLATTER, bookingId)}
                                color="secondary"
                                name={GoogleForm.Additions.FRUIT_PLATTER}
                                checked={formValues[GoogleForm.Additions.FRUIT_PLATTER].value}
                                value={formValues[GoogleForm.Additions.FRUIT_PLATTER].value}
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
                                    id={createUniqueId(GoogleForm.Additions.LOLLY_BAGS, bookingId)}
                                    color="secondary"
                                    name={GoogleForm.Additions.LOLLY_BAGS}
                                    checked={formValues[GoogleForm.Additions.LOLLY_BAGS].value}
                                    value={formValues[GoogleForm.Additions.LOLLY_BAGS].value}
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
                                    id={createUniqueId(GoogleForm.Additions.SANDWICH_PLATTER, bookingId)}
                                    color="secondary"
                                    name={GoogleForm.Additions.SANDWICH_PLATTER}
                                    checked={formValues[GoogleForm.Additions.SANDWICH_PLATTER].value}
                                    value={formValues[GoogleForm.Additions.SANDWICH_PLATTER].value}
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
                                    id={createUniqueId(GoogleForm.Additions.VEGGIE_PLATTER, bookingId)}
                                    color="secondary"
                                    name={GoogleForm.Additions.VEGGIE_PLATTER}
                                    checked={formValues[GoogleForm.Additions.VEGGIE_PLATTER].value}
                                    value={formValues[GoogleForm.Additions.VEGGIE_PLATTER].value}
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
                                    id={createUniqueId(GoogleForm.Additions.WATERMELON_PLATTER, bookingId)}
                                    color="secondary"
                                    name={GoogleForm.Additions.WATERMELON_PLATTER}
                                    checked={formValues[GoogleForm.Additions.WATERMELON_PLATTER].value}
                                    value={formValues[GoogleForm.Additions.WATERMELON_PLATTER].value}
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
                                    id={createUniqueId(GoogleForm.Additions.WEDGES, bookingId)}
                                    color="secondary"
                                    name={GoogleForm.Additions.WEDGES}
                                    checked={formValues[GoogleForm.Additions.WEDGES].value}
                                    value={formValues[GoogleForm.Additions.WEDGES].value}
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
                            id={createUniqueId(GoogleForm.Fields.CAKE, bookingId)}
                            name={GoogleForm.Fields.CAKE}
                            label="Cake"
                            fullWidth
                            size="small"
                            variant={(editing || formValues[GoogleForm.Fields.CAKE].value) ? 'outlined' : 'filled'}
                            disabled={!editing}
                            classes={{ root: classes.disabled }}
                            value={formValues[GoogleForm.Fields.CAKE].value}
                            error={formValues[GoogleForm.Fields.CAKE].error}
                            onChange={handleFormChange}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl
                            fullWidth
                            size="small"
                            variant={formValues[GoogleForm.Fields.CAKE_FLAVOUR].value ? 'standard' : 'filled'}
                            classes={{ root: classes.disabled }}
                        >
                            <InputLabel>Cake flavour</InputLabel>
                            <Select
                                inputProps={{
                                    name: GoogleForm.Fields.CAKE_FLAVOUR,
                                    id: GoogleForm.Fields.CAKE_FLAVOUR,
                                    value: formValues[GoogleForm.Fields.CAKE_FLAVOUR].value || ''
                                }}
                                disabled={!editing}
                                error={formValues[GoogleForm.Fields.CAKE_FLAVOUR].error}
                                onChange={handleFormChange}
                            >
                                {Object.values(GoogleForm.CakeFlavours).map(flavour => (
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
                            id={createUniqueId(GoogleForm.Fields.QUESTIONS, bookingId)}
                            name={GoogleForm.Fields.QUESTIONS}
                            label="Questions"
                            fullWidth
                            multiline
                            size="small"
                            variant={(editing || formValues[GoogleForm.Fields.QUESTIONS].value) ? 'outlined' : 'filled'}
                            disabled={!editing}
                            classes={{ root: classes.disabled }}
                            error={formValues[GoogleForm.Fields.QUESTIONS].error}
                            value={formValues[GoogleForm.Fields.QUESTIONS].value}
                            onChange={handleFormChange}
                        />
                    </Grid>
                }
                {displayFunFacts &&
                    <Grid item xs={12}>
                        <TextField
                            id={createUniqueId(GoogleForm.Fields.FUN_FACTS, bookingId)}
                            name={GoogleForm.Fields.FUN_FACTS}
                            label="Fun Facts"
                            fullWidth
                            multiline
                            size="small"
                            variant={(editing || formValues[GoogleForm.Fields.FUN_FACTS].value) ? 'outlined' : 'filled'}
                            disabled={!editing}
                            classes={{ root: classes.disabled }}
                            error={formValues[GoogleForm.Fields.FUN_FACTS].error}
                            value={formValues[GoogleForm.Fields.FUN_FACTS].value}
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

export default compose(
    withErrorDialog,
    withConfirmationDialog,
    withFirebase
)(ExistingBookingForm)