import React, { useState } from 'react'
import { withFirebase } from '../../Firebase'
import 'typeface-roboto'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns'
import { InputLabel, MenuItem, FormHelperText, FormControlLabel, Checkbox } from '@material-ui/core'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import SaveIcon from '@material-ui/icons/Save'
import CheckIcon from '@material-ui/icons/Check'
import CircularProgress from '@material-ui/core/CircularProgress'
import Fab from '@material-ui/core/Fab'
import { green } from '@material-ui/core/colors'
import { validateFormOnChange, validateFormOnSubmit, errorFound } from '../validation'

const dateFormat = require('dateformat')

const useStyles = makeStyles(theme => ({
    saveButtonDiv: {
        display: 'flex',
        justifyContent: 'flex-end'
    },
    saveButton: {
        marginTop: theme.spacing(3),
        // marginLeft: theme.spacing(3)
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
    }
}))

/** Function, not const obj, to avoid mutation. Each call returns an empty form. */
const getEmptyValues = () => (
    {
        parentFirstName: {
            value: '',
            error: false,
            errorText: 'First name cannot be empty'
        },
        parentLastName: {
            value: '',
            error: false,
            errorText: 'Last name cannot be empty'
        },
        parentEmail: {
            value: '',
            error: false,
            errorText: "Email address cannot be empty"
        },
        parentMobile: {
            value: '',
            error: false,
            errorText: 'Mobile number cannot be empty'
        },
        childName: {
            value: '',
            error: false,
            errorText: 'Child name cannot be empty'
        },
        childAge: {
            value: '',
            error: false,
            errorText: 'Child age cannot be empty'
        },
        date: {
            value: null,
            error: false,
            errorText: 'Date cannot be empty'
        },
        time: {
            value: '',
            error: false,
            errorText: 'Time cannot be empty'
        },
        location: {
            value: '',
            error: false,
            errorText: 'Location cannot be empty'
        },
        partyLength: {
            value: '',
            error: false,
            errorText: 'Party length cannot be empty'
        },
        address: {
            value: '',
            error: false,
            errorText: 'Address cannot be empty'
        },
        notes: {
            value: '',
            error: false,
            errorText: ''
        },
        creation1: {
            value: '',
            error: false,
            errorText: ''
        },
        creation2: {
            value: '',
            error: false,
            errorText: ''
        },
        creation3: {
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
const convertBookingObject = formValues => {

    var booking = {}
    for (let field in formValues) {
        booking[field] = formValues[field].value
    }

    // combine date and time into one
    var isoString = `${booking.date.toISOString().split('T')[0]}T${booking.time}:00`
    var dateTime = new Date(isoString)
    delete booking.date
    delete booking.time
    booking['dateTime'] = dateTime

    return booking
}

function mapBookingToFormValues(booking) {
    var formValues = getEmptyValues()

    for (let field in formValues) {
        formValues[field].value = booking[field]
    }

    const dateTime = booking.dateTime.toDate()
    formValues.date.value = dateTime
    formValues.time.value = dateFormat(dateTime, "HH:MM")

    return formValues
}

const ExistingBookingForm = props => {

    const classes = useStyles()

    const { firebase, booking } = props

    const initialValues = booking ? mapBookingToFormValues(booking) : getEmptyValues

    const [formValues, setFormValues] = useState(initialValues)
    const [valid, setValid] = useState(true)
    const [editing, setEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleFormChange = e => {
        const isDateField = e instanceof Date
        let field = isDateField ? 'date' : e.target.name
        let value
        if (isDateField) {
            value = e
        } else if (field == "sendConfirmationEmail") {
            value = e.target.checked
        } else {
            value = e.target.value
        }
        let tmpValues = { ...formValues }
        tmpValues[field].value = value
        tmpValues = validateFormOnChange(tmpValues, field, value)

        // clear the value and errors of the address field if it is no longer required
        if (field === 'location' && value !== 'mobile') {
            tmpValues.address.value = ''
            tmpValues.address.error = false
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
        var booking = convertBookingObject(formValues)

        firebase.functions.httpsCallable('createBooking')({
            auth: firebase.auth.currentUser.toJSON(),
            data: JSON.stringify(booking)
        }).then(result => {
            console.log(result.data)
            setLoading(false)
            setSuccess(true)
            setTimeout(() => { // let user see success for a second, then close the dialog
                props.onSuccess('1234')
            }, 1000)
        }).catch(err => {
            console.log(err)
            setLoading(false)
            setSuccess(false)
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
                        id="parentFirstName"
                        name="parentFirstName"
                        label="Parent first name"
                        fullWidth
                        variant="outlined"
                        autoComplete='off'
                        disabled={editing}
                        value={formValues.parentFirstName.value}
                        error={formValues.parentFirstName.error}
                        helperText={formValues.parentFirstName.error || ''}
                        onChange={handleFormChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        id="parentLastName"
                        name="parentLastName"
                        label="Parent last name"
                        fullWidth
                        variant="outlined"
                        disabled={editing}
                        value={formValues.parentLastName.value}
                        error={formValues.parentLastName.error}
                        helperText={formValues.parentLastName.error || ''}
                        onChange={handleFormChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        id="parentEmail"
                        name="parentEmail"
                        label="Parent email"
                        fullWidth
                        variant="outlined"
                        disabled={editing}
                        value={formValues.parentEmail.value}
                        error={formValues.parentEmail.error}
                        helperText={formValues.parentEmail.error || ''}
                        onChange={handleFormChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField
                    id="parentMobile"
                    name="parentMobile"
                    label="Parent mobile"
                    fullWidth
                    variant="outlined"
                    disabled={editing}
                    value={formValues.parentMobile.value}
                    error={formValues.parentMobile.error}
                    helperText={formValues.parentMobile.error || ''}
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
                        id="childName"
                        name="childName"
                        label="Child name"
                        fullWidth
                        variant="outlined"
                        disabled={editing}
                        value={formValues.childName.value}
                        error={formValues.childName.error}
                        helperText={formValues.childName.error || ''}
                        onChange={handleFormChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        id="childAge"
                        name="childAge"
                        label="Child age"
                        fullWidth
                        variant="outlined"
                        disabled={editing}
                        value={formValues.childAge.value}
                        error={formValues.childAge.error}
                        helperText={formValues.childAge.error || ''}
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
                            id="date"
                            label="Date of party"
                            autoOk="true"
                            disabled={editing}
                            value={formValues.date.value}
                            error={formValues.date.error}
                            helperText={formValues.date.error || ''}
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
                        id="time"
                        name="time"
                        label="Party time"
                        type="time"
                        disabled={editing}
                        value={formValues.time.value}
                        error={formValues.time.error}
                        helperText={formValues.time.error || ''}
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
                                name: 'location',
                                id: 'location',
                                value: formValues.location.value || ''
                            }}
                            disabled={editing}
                            error={formValues.location.error}
                            onChange={handleFormChange}
                        >
                            <MenuItem value={'balwyn'}>Balwyn</MenuItem>
                            <MenuItem value={'malvern'}>Malvern</MenuItem>
                            <MenuItem value={'mobile'}>Mobile</MenuItem>
                    </Select>
                    {formValues.location.error ? (
                        <FormHelperText error={true}>{formValues.location.errorText}</FormHelperText>
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
                                name: 'partyLength',
                                id: 'partyLength',
                                value: formValues.partyLength.value || ''
                            }}
                            disabled={editing}
                            error={formValues.partyLength.error}
                            onChange={handleFormChange}
                        >
                            <MenuItem value={'1'}>1 hour</MenuItem>
                            <MenuItem value={'1.5'}>1.5 hours</MenuItem>
                            <MenuItem value={'2'}>2 hours</MenuItem>
                    </Select>
                    {formValues.partyLength.error &&
                        <FormHelperText error={true}>{formValues.partyLength.errorText}</FormHelperText>}
                    </FormControl>
                </Grid>
                {formValues.location.value === 'mobile' &&
                    <Grid item xs={12}>
                        <TextField
                            id="address"
                            name="address"
                            label="Address"
                            fullWidth
                            variant="outlined"
                            disabled={editing}
                            value={formValues.address.value}
                            error={formValues.address.error}
                            helperText={formValues.address.error || ''}
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
                        id="notes"
                        name="notes"
                        label="Notes"
                        fullWidth
                        variant="outlined"
                        multiline
                        disabled={editing}
                        value={formValues.notes.value}
                        error={formValues.notes.error}
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
                                name: 'creation1',
                                id: 'creation1',
                                value: formValues.creation1.value || ''
                            }}
                            disabled={editing}
                            error={formValues.creation1.error}
                            onChange={handleFormChange}
                        >
                            <MenuItem value={'fluffy_slime'}>Fluffy Slime</MenuItem>
                            <MenuItem value={'bath_bombs'}>Bath Bombs</MenuItem>
                            <MenuItem value={'soap'}>Soap</MenuItem>
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
                                name: 'creation2',
                                id: 'creation2',
                                value: formValues.creation2.value || ''
                            }}
                            disabled={editing}
                            error={formValues.creation2.error}
                            onChange={handleFormChange}
                        >
                            <MenuItem value={'fluffy_slime'}>Fluffy Slime</MenuItem>
                            <MenuItem value={'bath_bombs'}>Bath Bombs</MenuItem>
                            <MenuItem value={'soap'}>Soap</MenuItem>
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
                                name: 'creation3',
                                id: 'creation3',
                                value: formValues.creation3.value || ''
                            }}
                            disabled={editing}
                            error={formValues.creation3.error}
                            onChange={handleFormChange}
                        >
                            <MenuItem value={'fluffy_slime'}>Fluffy Slime</MenuItem>
                            <MenuItem value={'bath_bombs'}>Bath Bombs</MenuItem>
                            <MenuItem value={'soap'}>Soap</MenuItem>
                    </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6">
                        Additions
                    </Typography>
                </Grid>
                <Grid item xs={3}>
                    <FormControlLabel
                        control={<Checkbox
                                    id="chickenNuggets"
                                    color="secondary"
                                    name="chickenNuggets"
                                    checked={false}
                                    value={''}
                                    onChange={handleFormChange} />}
                        label="Chicken Nuggets"
                    />
                </Grid>
                <Grid item xs={3}>
                    <FormControlLabel
                        control={<Checkbox
                                    id="chickenNuggets"
                                    color="secondary"
                                    name="chickenNuggets"
                                    checked={false}
                                    value={''}
                                    onChange={handleFormChange} />}
                        label="Chicken Nuggets"
                    />
                </Grid>
                <Grid item xs={3}>
                    <FormControlLabel
                        control={<Checkbox
                                    id="chickenNuggets"
                                    color="secondary"
                                    name="chickenNuggets"
                                    checked={false}
                                    value={''}
                                    onChange={handleFormChange} />}
                        label="Chicken Nuggets"
                    />
                </Grid>
                <Grid item xs={3}>
                    <FormControlLabel
                        control={<Checkbox
                                    id="chickenNuggets"
                                    color="secondary"
                                    name="chickenNuggets"
                                    checked={false}
                                    value={''}
                                    onChange={handleFormChange} />}
                        label="Chicken Nuggets"
                    />
                </Grid>
                <Grid item xs={3}>
                    <FormControlLabel
                        control={<Checkbox
                                    id="chickenNuggets"
                                    color="secondary"
                                    name="chickenNuggets"
                                    checked={false}
                                    value={''}
                                    onChange={handleFormChange} />}
                        label="Chicken Nuggets"
                    />
                </Grid>
                <Grid item xs={3}>
                    <FormControlLabel
                        control={<Checkbox
                                    id="chickenNuggets"
                                    color="secondary"
                                    name="chickenNuggets"
                                    checked={false}
                                    value={''}
                                    onChange={handleFormChange} />}
                        label="Chicken Nuggets"
                    />
                </Grid>
                <Grid item xs={3}>
                    <FormControlLabel
                        control={<Checkbox
                                    id="chickenNuggets"
                                    color="secondary"
                                    name="chickenNuggets"
                                    checked={false}
                                    value={''}
                                    onChange={handleFormChange} />}
                        label="Chicken Nuggets"
                    />
                </Grid>
                <Grid item xs={3}>
                    <FormControlLabel
                        control={<Checkbox
                                    id="chickenNuggets"
                                    color="secondary"
                                    name="chickenNuggets"
                                    checked={false}
                                    value={''}
                                    onChange={handleFormChange} />}
                        label="Chicken Nuggets"
                    />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6">
                        Cake
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        id="cake"
                        name="cake"
                        label="Cake"
                        fullWidth
                        variant="outlined"
                        disabled={editing}
                        value={formValues.notes.value}
                        error={formValues.notes.error}
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
                                name: 'cakeFlavour',
                                id: 'cakeFlavour',
                                value: formValues.creation3.value || ''
                            }}
                            disabled={editing}
                            error={formValues.creation3.error}
                            onChange={handleFormChange}
                        >
                            <MenuItem value={'chocolate'}>Chocolate</MenuItem>
                            <MenuItem value={'vanilla'}>Vanilla</MenuItem>
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
                        id="questions"
                        name="questions"
                        label="Questions"
                        fullWidth
                        variant="outlined"
                        disabled={editing}
                        value={formValues.notes.value}
                        error={formValues.notes.error}
                        onChange={handleFormChange}
                    />
                </Grid>
            </Grid>
            <div className={classes.saveButtonDiv}>
                <Fab
                    className={success ? classes.success : classes.saveButton}
                    aria-label="save"
                    color="primary"
                    type="submit"
                    disabled={loading || !valid}
                    onClick={handleSubmit}
                >
                    {success ? <CheckIcon /> : <SaveIcon />}
                </Fab>
                {loading && <CircularProgress size={68} className={classes.progress} />}
            </div>
        </>
    )
}

export default withFirebase(ExistingBookingForm)