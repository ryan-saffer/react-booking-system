import { FormBookingFields } from 'fizz-kidz'

/**
 * Validates the form values, sets any errors and error text messages.
 *
 * @param formValues - the formValues object reperesenting the form
 * @param field - the field name that was changed
 * @param value - the value form value that was changed
 * @return {object} the updated form values object
 */
export function validateFormOnChange(formValues, field, value) {
    switch (field) {
        // all the following only need to check for empty values
        case FormBookingFields.parentFirstName:
        case FormBookingFields.parentLastName:
        case FormBookingFields.childName:
        case FormBookingFields.childAge:
        case FormBookingFields.time:
        case FormBookingFields.date:
        case FormBookingFields.location:
        case FormBookingFields.address:
        case FormBookingFields.includesFood:
            formValues[field].error = value === ''
            break
        case FormBookingFields.parentEmail:
            // email must be checked if valid
            if (value === '') {
                formValues[field].error = true
                formValues[field].errorText = 'Email cannot be empty'
            } else if (emailIsInvalid(value)) {
                formValues[field].error = true
                formValues[field].errorText = 'Email is not valid'
            } else {
                formValues[field].error = false
            }
            break
        case FormBookingFields.parentMobile:
            // mobile number must be 10 digits long
            if (value === '') {
                formValues[field].error = true
                formValues[field].errorText = 'Mobile number cannot be empty'
                break
            }
            if (value.length !== 10) {
                formValues[field].error = true
                formValues[field].errorText = 'Mobile number must be 10 digits long'
            } else {
                formValues[field].error = false
            }
            break
        case FormBookingFields.type:
        case FormBookingFields.partyLength:
            // checks the location and length combination is valid
            formValues[field].error = value === ''
            if (locationAndTimeIsInvalid(formValues)) {
                formValues[FormBookingFields.partyLength].error = true
                var length = `${formValues[FormBookingFields.partyLength].value} hour`
                if (formValues[FormBookingFields.partyLength].value > 1) length += 's'
                formValues[FormBookingFields.partyLength].errorText = `A ${
                    formValues[FormBookingFields.type].value
                } party cannot be of length ${length}`
                break
            } else if (field === FormBookingFields.location) {
                formValues[FormBookingFields.partyLength].error = false
            }
            break
        default:
            break
    }

    return formValues
}

/**
 * Determines whether the combination of location and length is valid.
 *
 * @param {object} formValues - the formValues object representing the form
 * @return {boolean} - whether or not the combination is valid
 */
function locationAndTimeIsInvalid(formValues) {
    var type = formValues[FormBookingFields.type].value
    var length = formValues[FormBookingFields.partyLength].value
    if (type === 'studio' && length === '1') {
        console.log('in store party of 1 hour - invalid')
        return true
    } else if (type === 'mobile' && length === '2') {
        console.log('mobile party of two hours - invalid')
        return true
    }
    return false
}

/**
 * Validates the form when submitting.
 * Runs through all form values and ensures they aren't empty.
 * Then checks for any errors in the form.
 *
 * @param {object} formValues - the formValues representing the form
 * @return {object} - if there is an error, returns the form values, otherwise returns null
 */
export function validateFormOnSubmit(formValues) {
    for (let field in formValues) {
        // notes not required, address only required in some cases
        // no need to validate creations, cake and questions
        if (
            field !== FormBookingFields.address &&
            field !== FormBookingFields.includesFood &&
            field !== FormBookingFields.numberOfChildren &&
            field !== FormBookingFields.notes &&
            field !== FormBookingFields.creation1 &&
            field !== FormBookingFields.creation2 &&
            field !== FormBookingFields.creation3 &&
            field !== FormBookingFields.cake &&
            field !== FormBookingFields.cakeFlavour &&
            field !== FormBookingFields.questions &&
            field !== FormBookingFields.funFacts
        ) {
            formValues[field].error = formValues[field].value === '' || formValues[field].value === null
        }
    }

    // validate address here
    if (formValues[FormBookingFields.type].value === 'mobile') {
        formValues[FormBookingFields.address].error = formValues[FormBookingFields.address].value === ''
    }

    // validate food package here
    if (formValues[FormBookingFields.type].value === 'studio') {
        formValues[FormBookingFields.includesFood].error = formValues[FormBookingFields.includesFood].value === ''
    }

    return errorFound(formValues) ? formValues : null
}

/**
 * Iterates the form values and checks for any errors
 *
 * @param {object} formValues - The form values object
 * @return {boolean} Whether or not an error exists
 */
export function errorFound(formValues) {
    var foundError = false
    for (let field in formValues) {
        if (formValues[field].error) {
            foundError = true
        }
    }
    return foundError
}

/**
 * Determines whether or not a string is an invalid email address
 *
 * @param {string} email - the email to validate
 * @return {boolean} whether or not the email is invalid
 */
export function emailIsInvalid(email) {
    // eslint-disable-next-line
    var re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return !re.test(String(email).toLowerCase())
}
