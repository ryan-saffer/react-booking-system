export function retrieveForm(client, formId) {
    return client.forms.find(form => form.id === formId)?.values
}

export function retrieveFormField(form, fieldId) {
    return form?.find(field => field.fieldID === fieldId)?.value
}

export function retrieveFormAndField(client, formId, fieldId) {
    return retrieveFormField(retrieveForm(client, formId), fieldId)
}