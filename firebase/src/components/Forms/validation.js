import { GoogleForm } from 'fizz-kidz'

/**
 * Validates the form values, sets any errors and error text messages.
 * 
 * @param {object} formValues - the formValues object reperesenting the form
 * @param {string} field - the field name that was changed
 * @param {string} value - the value form value that was changed
 * @return {object} the updated form values object
 */
export function validateFormOnChange(formValues, field, value) {

    switch (field) {
        // all the following only need to check for empty values
        case GoogleForm.Fields.PARENT_FIRST_NAME:
        case GoogleForm.Fields.PARENT_LAST_NAME:
        case GoogleForm.Fields.CHILD_NAME:
        case GoogleForm.Fields.CHILD_AGE:
        case GoogleForm.Fields.TIME:
        case GoogleForm.Fields.DATE:
        case GoogleForm.Fields.ADDRESS:
            formValues[field].error = value === ''
            break
        case GoogleForm.Fields.PARENT_EMAIL:
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
        case GoogleForm.Fields.PARENT_MOBILE:
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
        case GoogleForm.Fields.LOCATION:
        case GoogleForm.Fields.PARTY_LENGTH:
            // checks the location and length combination is valid
            formValues[field].error = value === ''
            if (locationAndTimeIsInvalid(formValues)) {
                formValues[GoogleForm.Fields.PARTY_LENGTH].error = true
                var length = `${formValues[GoogleForm.Fields.PARTY_LENGTH].value} hour`
                if (formValues[GoogleForm.Fields.PARTY_LENGTH].value > 1) length += 's'
                formValues[GoogleForm.Fields.PARTY_LENGTH].errorText = `A ${formValues[GoogleForm.Fields.LOCATION].value} party cannot be of length ${length}`
                break
            } else if (field === GoogleForm.Fields.LOCATION) {
                formValues[GoogleForm.Fields.PARTY_LENGTH].error = false
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
    var storeLocations = Object.values(GoogleForm.Locations).filter(location => location !== 'mobile')
    var location = formValues[GoogleForm.Fields.LOCATION].value
    var length = formValues[GoogleForm.Fields.PARTY_LENGTH].value
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
        if (field !== GoogleForm.Fields.ADDRESS &&
            field !== GoogleForm.Fields.NUMBER_OF_CHILDREN &&
            field !== GoogleForm.Fields.NOTES &&
            field !== GoogleForm.Fields.CREATION_1 &&
            field !== GoogleForm.Fields.CREATION_2 &&
            field !== GoogleForm.Fields.CREATION_3 &&
            field !== GoogleForm.Fields.CAKE &&
            field !== GoogleForm.Fields.CAKE_FLAVOUR &&
            field !== GoogleForm.Fields.QUESTIONS &&
            field !== GoogleForm.Fields.FUN_FACTS) {
            formValues[field].error = formValues[field].value === '' || formValues[field].value === null
        }
    }

    // validate address here
    if (formValues[GoogleForm.Fields.LOCATION].value === 'mobile') {
        formValues[GoogleForm.Fields.ADDRESS].error = formValues[GoogleForm.Fields.ADDRESS].value === ''
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