// import { ObjectKeys } from '../utilities'
import { ObjectKeys } from '../utilities'
import { StoreCalendars } from './constants/Calendars'

export function retrieveForm(client: any, formId: any) {
    return client.forms.find((form: any) => form.id === formId)?.values
}

export function retrieveFormField(form: any, fieldId: any) {
    return form?.find((field: any) => field.fieldID === fieldId)?.value
}

export function retrieveFormAndField(client: any, formId: any, fieldId: any) {
    return retrieveFormField(retrieveForm(client, formId), fieldId)
}

export function getStudioByCalendarId(id: number) {
    const keys = ObjectKeys(StoreCalendars)
    for (const key of keys) {
        if (StoreCalendars[key] === id) return key
    }
    throw new Error(`unrecognised calendar id: ${id}`)
}
