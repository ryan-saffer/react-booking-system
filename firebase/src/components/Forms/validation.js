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
        case 'parentFirstName':
        case 'parentLastName':
        case 'childName':
        case 'childAge':
        case 'time':
        case 'address':
            formValues[field].error = value === ''
            break
        case 'parentEmail':
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
        case 'parentMobile':
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
        case 'location':
        case 'partyLength':
            // checks the location and length combination is valid
            formValues[field].error = value === ''
            if (locationAndTimeIsInvalid(formValues)) {
                formValues.partyLength.error = true
                var length = `${formValues.partyLength.value} hour`
                if (formValues.partyLength.value > 1) length += 's'
                formValues.partyLength.errorText = `A ${formValues.location.value} party cannot be of length ${length}`
                break
            } else if (field === 'location') {
                formValues.partyLength.error = false
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
    var storeLocations = ['malvern', 'balwyn']
    var location = formValues['location'].value
    var length = formValues['partyLength'].value
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
        if (field !== 'address' && field !== 'notes') {
            formValues[field].error = formValues[field].value === '' || formValues[field].value === null
        }
    }

    // validate address here
    if (formValues.location.value === 'mobile') {
        formValues.address.error = formValues.address.value === ''
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