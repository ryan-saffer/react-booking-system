import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Fab from '@material-ui/core/Fab'
import { withFirebase } from '../../Firebase'
import 'typeface-roboto'
import SaveIcon from '@material-ui/icons/Save'
import CheckIcon from '@material-ui/icons/Check'
import CircularProgress from '@material-ui/core/CircularProgress'
import { green } from '@material-ui/core/colors'
import AdditionalBookingDetails from '../AdditionalBookingDetails'
import BaseBookingDetails, { handleBaseBookingFormChange } from '../BaseBookingDetails'
import { validateFormOnSubmit } from '../baseBookingFormValidation'


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
        sendConfirmationEmail: {
            value: true,
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
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [editing, setEditing] = useState(!booking)
    const [valid, setValid] = useState(true)

    const handleFormChange = changedValues => e => {

        const [tmpValid, tmpFormValues] = handleBaseBookingFormChange(changedValues, e)
        setValid(tmpValid)
        setFormValues(tmpFormValues)
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
        <BaseBookingDetails
            formValues={formValues}
            editing={editing}
            onFormChange={handleFormChange}
        />
        <AdditionalBookingDetails />
        <div className={classes.saveButtonDiv}>
            <Fab
                className={success ? classes.success : classes.saveButton}
                aria-label="save"
                color="primary"
                type="submit"
                disabled={loading || !editing || !valid}
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