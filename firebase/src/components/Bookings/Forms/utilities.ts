import moment from 'moment'
import dateFormat from 'dateformat'
import { Booking, FirestoreBooking, FormBooking, Locations, Utilities } from 'fizz-kidz'
import { ExistingBookingFormFields } from './ExistingBookingForm/types'

/**
 * Strips out the error and errorText fields, leaving only the field and value
 *
 * @param {object} formValues - the form values as an object
 * @return {object} the booking ready to be written to firestore
 */
export function mapFormToBooking(formValues: ExistingBookingFormFields): Booking {
    let booking = getEmptyDomainBooking()
    Object.keys(booking).forEach((key) => {
        if (Utilities.isObjKey(key, booking)) {
            booking[key] = formValues[key]?.value as never // safe given we know key is a keyof DomainBooking
        }
    })

    // trim fields
    booking.parentFirstName = booking.parentFirstName.trim()
    booking.parentLastName = booking.parentLastName.trim()
    booking.childName = booking.childName.trim()
    booking.childAge = booking.childAge.trim()

    return convertFormBookingToBooking(booking)
}

function convertFormBookingToBooking(formBooking: FormBooking): Booking {
    // combine date and time into one
    // hardcode to AEST to ensure bookings can be created/updated from anywhere in the world
    let options = { timeZone: 'Australia/Melbourne' }
    let dateTime = moment
        .tz(
            `${formBooking.date.toLocaleDateString('en-au', options)} ${formBooking.time}}`,
            'DD/MM/YYYY hh:mm',
            'Australia/Melbourne'
        )
        .toDate()

    // downcast to any, since we know deleting date and time is safe.
    // without the cast, the fields can't be deleted. If downcasting to BaseBooking, the fields dont exist.
    let temp = formBooking as any
    delete temp.date
    delete temp.time

    let booking = temp as Booking
    booking.dateTime = dateTime
    return booking
}

export function mapFirestoreBookingToFormValues(firestoreBooking: FirestoreBooking): ExistingBookingFormFields {
    const domainBooking = convertFirestoreBookingToFormBooking({ ...firestoreBooking }) // copy so as not to mutate original value
    let formValues = getEmptyValues()

    for (let field in formValues) {
        if (Utilities.isObjKey(field, formValues)) {
            const val = domainBooking[field]
            if (val) {
                const prop = formValues[field]
                if (prop) prop.value = val
            }
        }
    }

    formValues.date.value = domainBooking.date
    formValues.time.value = domainBooking.time

    return formValues
}

function convertFirestoreBookingToFormBooking(firestoreBooking: FirestoreBooking): FormBooking {
    const dateTime = firestoreBooking.dateTime.toDate()

    // downcast to any, since we know deleting dateTime is safe.
    // without the cast, the fields can't be deleted. If downcasting to BaseBooking, the fields dont exist.
    const booking = firestoreBooking as any
    delete booking.dateTime

    const formBooking = booking as FormBooking
    formBooking.date = dateTime
    formBooking.time = dateFormat(dateTime, 'HH:MM')

    return formBooking
}

/** Function, not const obj, to avoid mutation. Each call returns an empty form. */
export function getEmptyValues(): ExistingBookingFormFields {
    return {
        parentFirstName: {
            value: '',
            error: false,
            errorText: 'First name cannot be empty',
        },
        parentLastName: {
            value: '',
            error: false,
            errorText: 'Last name cannot be empty',
        },
        parentEmail: {
            value: '',
            error: false,
            errorText: 'Email address cannot be empty',
        },
        parentMobile: {
            value: '',
            error: false,
            errorText: 'Mobile number cannot be empty',
        },
        childName: {
            value: '',
            error: false,
            errorText: 'Child name cannot be empty',
        },
        childAge: {
            value: '',
            error: false,
            errorText: 'Child age cannot be empty',
        },
        date: {
            value: new Date(),
            error: false,
            errorText: 'Date cannot be empty',
        },
        time: {
            value: '',
            error: false,
            errorText: 'Time cannot be empty',
        },
        location: {
            value: Locations.BALWYN,
            error: false,
            errorText: 'Location cannot be empty',
        },
        type: {
            value: 'in-store',
            error: false,
            errorText: 'Party type cannot be empty',
        },
        partyLength: {
            value: '1',
            error: false,
            errorText: 'Party length cannot be empty',
        },
        address: {
            value: '',
            error: false,
            errorText: 'Address cannot be empty',
        },
        numberOfChildren: {
            value: '',
            error: false,
            errorText: '',
        },
        notes: {
            value: '',
            error: false,
            errorText: '',
        },
        creation1: {
            value: undefined,
            error: false,
            errorText: '',
        },
        creation2: {
            value: undefined,
            error: false,
            errorText: '',
        },
        creation3: {
            value: undefined,
            error: false,
            errorText: '',
        },
        chickenNuggets: {
            value: false,
            error: false,
            errorText: '',
        },
        fairyBread: {
            value: false,
            error: false,
            errorText: '',
        },
        fruitPlatter: {
            value: false,
            error: false,
            errorText: '',
        },
        frankfurts: {
            value: false,
            error: false,
            errorText: '',
        },
        lollyBags: {
            value: false,
            error: false,
            errorText: '',
        },
        sandwichPlatter: {
            value: false,
            error: false,
            errorText: '',
        },
        veggiePlatter: {
            value: false,
            error: false,
            errorText: '',
        },
        vegetarianQuiche: {
            value: false,
            error: false,
            errorText: '',
        },
        watermelonPlatter: {
            value: false,
            error: false,
            errorText: '',
        },
        wedges: {
            value: false,
            error: false,
            errorText: '',
        },
        grazingPlatterMedium: {
            value: false,
            error: false,
            errorText: '',
        },
        grazingPlatterLarge: {
            value: false,
            error: false,
            errorText: '',
        },
        volcanoPartyPack: {
            value: false,
            error: false,
            errorText: '',
        },
        lipBalmPartyPack: {
            value: false,
            error: false,
            errorText: '',
        },
        dinosaurBathBombPartyPack: {
            value: false,
            error: false,
            errorText: '',
        },
        slimePartyPack: {
            value: false,
            error: false,
            errorText: '',
        },
        cake: {
            value: '',
            error: false,
            errorText: '',
        },
        cakeFlavour: {
            value: undefined,
            error: false,
            errorText: '',
        },
        questions: {
            value: '',
            error: false,
            errorText: '',
        },
        funFacts: {
            value: '',
            error: false,
            errorText: '',
        },
        partyFormFilledIn: {
            value: false,
            error: false,
            errorText: '',
        },
        sendConfirmationEmail: {
            value: true,
            error: false,
            errorText: '',
        },
    }
}

function getEmptyDomainBooking(): FormBooking {
    return {
        parentFirstName: '',
        parentLastName: '',
        parentEmail: '',
        parentMobile: '',
        childName: '',
        childAge: '',
        location: Locations.BALWYN,
        type: 'in-store',
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
        frankfurts: false,
        veggiePlatter: false,
        vegetarianQuiche: false,
        watermelonPlatter: false,
        wedges: false,
        sandwichPlatter: false,
        lollyBags: false,
        grazingPlatterMedium: false,
        grazingPlatterLarge: false,
        volcanoPartyPack: false,
        lipBalmPartyPack: false,
        dinosaurBathBombPartyPack: false,
        slimePartyPack: false,
        partyFormFilledIn: false,
        sendConfirmationEmail: true,
    }
}
