import moment from "moment"
import { Bookings } from "fizz-kidz"
import { ExistingBookingFormFields } from "../components/Forms/ExistingBookingForm/types"
import firebase from "firebase"
import dateFormat from 'dateformat'

/**
 * Strips out the error and errorText fields, leaving only the field and value
 * 
 * @param {object} formValues - the form values as an object
 * @return {object} the booking ready to be written to firestore
 */
 export function mapFormToBooking(formValues: ExistingBookingFormFields): Bookings.FirestoreBooking {

    let booking = getEmptyDomainBooking()
    Object.keys(booking).forEach(key => booking[key] = formValues[key].value)

    // trim fields
    booking.parentFirstName = booking.parentFirstName.trim()
    booking.parentLastName = booking.parentLastName.trim()
    booking.childName = booking.childName.trim()
    booking.childAge = booking.childAge.trim()

    return convertDomainBookingToFirestoreBooking(booking)
}

function convertDomainBookingToFirestoreBooking(domainBooking: Bookings.DomainBooking): Bookings.FirestoreBooking {

    // combine date and time into one
    // hardcode to AEST to ensure bookings can be created/updated from anywhere in the world
    var options = { timeZone: "Australia/Melbourne" }
    var dateTime = moment.tz(
        `${domainBooking.date.toLocaleDateString('en-au', options)} ${domainBooking.time}}`,
        "DD/MM/YYYY hh:mm",
        "Australia/Melbourne"
    ).toDate()

    let booking = domainBooking as Bookings.BaseBooking
    delete booking.date
    delete booking.time

    let firestoreBooking = booking as Bookings.FirestoreBooking
    firestoreBooking.dateTime = firebase.firestore.Timestamp.fromDate(dateTime)
    return firestoreBooking
}

export function mapBookingToFormValues(firestoreBooking: Bookings.FirestoreBooking): ExistingBookingFormFields {

    const domainBooking = convertFirestoreBookingToDomainBooking(firestoreBooking)
    let formValues = getEmptyValues()

    for (let field in formValues) {
        const val = domainBooking[field]
        if (val) {
            formValues[field].value = val
        }
    }

    formValues.date.value = domainBooking.date
    formValues.time.value = domainBooking.time

    return formValues
}

function convertFirestoreBookingToDomainBooking(firestoreBooking: Bookings.FirestoreBooking): Bookings.DomainBooking {

    const dateTime = firestoreBooking.dateTime.toDate()

    const booking = firestoreBooking as Bookings.BaseBooking
    delete booking.dateTime

    const domainBooking = booking as Bookings.DomainBooking
    domainBooking.date = dateTime
    domainBooking.time = dateTime

    return domainBooking
}

/** Function, not const obj, to avoid mutation. Each call returns an empty form. */
export function getEmptyValues(): ExistingBookingFormFields {
    return {
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
            value: new Date(),
            error: false,
            errorText: 'Date cannot be empty'
        },
        time: {
            value: new Date(),
            error: false,
            errorText: 'Time cannot be empty'
        },
        location: {
            value: Bookings.Location.BALWYN,
            error: false,
            errorText: 'Location cannot be empty'
        },
        partyLength: {
            value: '1',
            error: false,
            errorText: 'Party length cannot be empty'
        },
        address: {
            value: null,
            error: false,
            errorText: 'Address cannot be empty'
        },
        numberOfChildren: {
            value: null,
            error: false,
            errorText: ''
        },
        notes: {
            value: null,
            error: false,
            errorText: ''
        },
        creation1: {
            value: null,
            error: false,
            errorText: ''
        },
        creation2: {
            value: null,
            error: false,
            errorText: ''
        },
        creation3: {
            value: null,
            error: false,
            errorText: ''
        },
        chickenNuggets: {
            value: null,
            error: false,
            errorText: ''
        },
        fairyBread: {
            value: null,
            error: false,
            errorText: ''
        },
        fruitPlatter: {
            value: null,
            error: false,
            errorText: ''
        },
        lollyBags: {
            value: null,
            error: false,
            errorText: ''
        },
        sandwichPlatter: {
            value: null,
            error: false,
            errorText: ''
        },
        veggiePlatter: {
            value: null,
            error: false,
            errorText: ''
        },
        watermelonPlatter: {
            value: null,
            error: false,
            errorText: ''
        },
        wedges: {
            value: null,
            error: false,
            errorText: ''
        },
        grazingPlatterMedium: {
            value: null,
            error: false,
            errorText: ''
        },
        grazingPlatterLarge: {
            value: null,
            error: false,
            errorText: ''
        },
        cake: {
            value: null,
            error: false,
            errorText: ''
        },
        cakeFlavour: {
            value: null,
            error: false,
            errorText: ''
        },
        questions: {
            value: null,
            error: false,
            errorText: ''
        },
        funFacts: {
            value: null,
            error: false,
            errorText: ''
        }
    }
}

function getEmptyDomainBooking(): Bookings.DomainBooking {
    return { 
        parentFirstName: '',
        parentLastName: '',
        parentEmail: '',
        parentMobile: '',
        childName: '',
        childAge: '',
        location: Bookings.Location.BALWYN,
        date: new Date(),
        time: new Date(),
        partyLength: '1',
        address: null,
        numberOfChildren: null,
        notes: null,
        creation1: null,
        creation2: null,
        creation3: null,
        cake: null,
        cakeFlavour: null,
        funFacts: null,
        questions: null,
        chickenNuggets: null,
        fairyBread: null,
        fruitPlatter: null,
        veggiePlatter: null,
        watermelonPlatter: null,
        wedges: null,
        sandwichPlatter: null,
        lollyBags: null,
        grazingPlatterMedium: null,
        grazingPlatterLarge: null
    }
}