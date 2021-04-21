import firebase from "firebase"
import moment from "moment"
import dateFormat from 'dateformat'
import { Bookings } from "fizz-kidz"
import { ExistingBookingFormFields } from "./ExistingBookingForm/types"
import { isObjKey } from "../../../utilities/typescriptUtilities"

/**
 * Strips out the error and errorText fields, leaving only the field and value
 * 
 * @param {object} formValues - the form values as an object
 * @return {object} the booking ready to be written to firestore
 */
 export function mapFormToBooking(formValues: ExistingBookingFormFields): Bookings.FirestoreBooking {

    let booking = getEmptyDomainBooking()
    Object.keys(booking).forEach(key => {
        if (isObjKey(key, booking)) {
            booking[key] = formValues[key].value as never // safe given we know key is a keyof DomainBooking
        }
    })

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

    // downcast to any, since we know deleting date and time is safe.
    // without the cast, the fields can't be deleted. If downcasting to BaseBooking, the fields dont exist.
    let booking = domainBooking as any
    delete booking.date
    delete booking.time

    let firestoreBooking = booking as Bookings.FirestoreBooking
    firestoreBooking.dateTime = firebase.firestore.Timestamp.fromDate(dateTime)
    return firestoreBooking
}

export function mapBookingToFormValues(firestoreBooking: Bookings.FirestoreBooking): ExistingBookingFormFields {

    const domainBooking = convertFirestoreBookingToDomainBooking({ ...firestoreBooking }) // copy so as not to mutate original value
    let formValues = getEmptyValues()

    for (let field in formValues) {
        if (isObjKey(field, formValues)) {
            const val = domainBooking[field]
            if (val) {
                formValues[field].value = val
            }
        }
    }

    formValues.date.value = domainBooking.date
    formValues.time.value = domainBooking.time

    return formValues
}

function convertFirestoreBookingToDomainBooking(firestoreBooking: Bookings.FirestoreBooking): Bookings.DomainBooking {

    const dateTime = firestoreBooking.dateTime.toDate()

    // downcast to any, since we know deleting dateTime is safe.
    // without the cast, the fields can't be deleted. If downcasting to BaseBooking, the fields dont exist.
    const booking = firestoreBooking as any
    delete booking.dateTime

    const domainBooking = booking as Bookings.DomainBooking
    domainBooking.date = dateTime
    domainBooking.time = dateFormat(dateTime, "HH:MM")

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
            value: '',
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
            value: '',
            error: false,
            errorText: 'Address cannot be empty'
        },
        numberOfChildren: {
            value: '',
            error: false,
            errorText: ''
        },
        notes: {
            value: '',
            error: false,
            errorText: ''
        },
        creation1: {
            value: undefined,
            error: false,
            errorText: ''
        },
        creation2: {
            value: undefined,
            error: false,
            errorText: ''
        },
        creation3: {
            value: undefined,
            error: false,
            errorText: ''
        },
        chickenNuggets: {
            value: false,
            error: false,
            errorText: ''
        },
        fairyBread: {
            value: false,
            error: false,
            errorText: ''
        },
        fruitPlatter: {
            value: false,
            error: false,
            errorText: ''
        },
        lollyBags: {
            value: false,
            error: false,
            errorText: ''
        },
        sandwichPlatter: {
            value: false,
            error: false,
            errorText: ''
        },
        veggiePlatter: {
            value: false,
            error: false,
            errorText: ''
        },
        watermelonPlatter: {
            value: false,
            error: false,
            errorText: ''
        },
        wedges: {
            value: false,
            error: false,
            errorText: ''
        },
        grazingPlatterMedium: {
            value: false,
            error: false,
            errorText: ''
        },
        grazingPlatterLarge: {
            value: false,
            error: false,
            errorText: ''
        },
        cake: {
            value: '',
            error: false,
            errorText: ''
        },
        cakeFlavour: {
            value: undefined,
            error: false,
            errorText: ''
        },
        questions: {
            value: '',
            error: false,
            errorText: ''
        },
        funFacts: {
            value: '',
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
        time: '',
        partyLength: '1',
        address: '',
        numberOfChildren: '',
        notes: '',
        creation1: undefined,
        creation2: undefined,
        creation3: undefined,
        cake: '',
        cakeFlavour: undefined,
        funFacts: '',
        questions: '',
        chickenNuggets: false,
        fairyBread: false,
        fruitPlatter: false,
        veggiePlatter: false,
        watermelonPlatter: false,
        wedges: false,
        sandwichPlatter: false,
        lollyBags: false,
        grazingPlatterMedium: false,
        grazingPlatterLarge: false
    }
}