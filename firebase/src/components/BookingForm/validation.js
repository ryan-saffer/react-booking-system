export function validateFormOnChange(formValues, field, value) {

    switch (field) {
        case 'parentFirstName':
        case 'parentLastName':
        case 'childName':
        case 'childAge':
        case 'time':
        case 'address':
            formValues[field].error = value === ''
            break
        case 'parentEmail':
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
    }

    return formValues
}

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

export function validateFormOnSubmit(formValues) {

    for (let field in formValues) {
        if (field !== 'address') { // validate address separately since not always required
            formValues[field].error = formValues[field].value === ''
        }
    }

    // validate address here
    if (formValues.location.value === 'mobile') {
        formValues.address.error = formValues.address.value === ''
    }

    return errorFound(formValues) ? formValues : null
}

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

function emailIsInvalid(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return !re.test(String(email).toLowerCase());
}