import { retrieveForm, retrieveFormField, retrieveFormAndField } from './acuity'

export function capitalise(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

export { retrieveForm, retrieveFormField, retrieveFormAndField }