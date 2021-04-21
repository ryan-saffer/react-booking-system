import { DomainBookingFields, Locations } from 'fizz-kidz'

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
        case DomainBookingFields.parentFirstName:
        case DomainBookingFields.parentLastName:
        case DomainBookingFields.childName:
        case DomainBookingFields.childAge:
        case DomainBookingFields.time:
        case DomainBookingFields.date:
        case DomainBookingFields.address:
            formValues[field].error = value === ''
            break
        case DomainBookingFields.parentEmail:
            // email must be checked if valid
            if (value === '') {
                formValues[field].error = true
                formValues[field].errorText = "Email cannot be empty"
            }
            else if (emailIsInvalid(value)) {
                formValues[field].error = true
                formValues[field].errorText = "Email is not valid"
            } else {
                formValues[field].error = false
            }
            break
        case DomainBookingFields.parentMobile:
            // mobile number must be 10 digits long
            if (value === '') {
                formValues[field].error = true
                formValues[field].errorText = "Mobile number cannot be empty"
                break
            }
            if (value.length !== 10) {
                formValues[field].error = true
                formValues[field].errorText = "Mobile number must be 10 digits long"
            } else {
                formValues[field].error = false
            }
            break
        case DomainBookingFields.location:
        case DomainBookingFields.partyLength:
            // checks the location and length combination is valid
            formValues[field].error = value === ''
            if (locationAndTimeIsInvalid(formValues)) {
                formValues[DomainBookingFields.partyLength].error = true
                var length = `${formValues[DomainBookingFields.partyLength].value} hour`
                if (formValues[DomainBookingFields.partyLength].value > 1) length += 's'
                formValues[DomainBookingFields.partyLength].errorText = `A ${formValues[DomainBookingFields.location].value} party cannot be of length ${length}`
                break
            } else if (field === DomainBookingFields.location) {
                formValues[DomainBookingFields.partyLength].error = false
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
    var storeLocations = Object.values(Locations).filter(location => location !== 'mobile')
    var location = formValues[DomainBookingFields.location].value
    var length = formValues[DomainBookingFields.partyLength].value
    if (storeLocations.includes(location) && length === '1') {
        return true
    } else if (location === 'mobile' && length === '2') {
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
        if (field !== DomainBookingFields.address &&
            field !== DomainBookingFields.numberOfChildren &&
            field !== DomainBookingFields.notes &&
            field !== DomainBookingFields.creation1 &&
            field !== DomainBookingFields.creation2 &&
            field !== DomainBookingFields.creation3 &&
            field !== DomainBookingFields.cake &&
            field !== DomainBookingFields.cakeFlavour &&
            field !== DomainBookingFields.questions &&
            field !== DomainBookingFields.funFacts) {
            formValues[field].error = formValues[field].value === '' || formValues[field].value === null
        }
    }

    // validate address here
    if (formValues[DomainBookingFields.location].value === 'mobile') {
        formValues[DomainBookingFields.address].error = formValues[DomainBookingFields.address].value === ''
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
            console.log(`Changing to invalid because ${field} has an error`)
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
function emailIsInvalid(email) {
    // eslint-disable-next-line
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return !re.test(String(email).toLowerCase());
}