// import { EventBooking } from 'fizz-kidz'

// type FormTypes = {
//     contactName: string
//     contactNumber: string
//     contactEmail: string
//     organisation: string
//     location: string
//     date: Date | null
//     startTime: string
//     endTime: string
//     notes: string
// }

// export type FormFields = { [Key in keyof FormTypes]: { value: FormTypes[Key]; error: boolean; errorText: string } }

// export const getEmptyFormValues = (): FormFields => ({
//     contactName: {
//         value: '',
//         error: false,
//         errorText: 'Contact name cannot be empty',
//     },
//     contactNumber: {
//         value: '',
//         error: false,
//         errorText: 'Contact number cannot be empty',
//     },
//     contactEmail: {
//         value: '',
//         error: false,
//         errorText: 'Contact email cannot be empty',
//     },
//     organisation: {
//         value: '',
//         error: false,
//         errorText: 'Organisation cannot be empty',
//     },
//     location: {
//         value: '',
//         error: false,
//         errorText: 'Location cannot be empty',
//     },
//     date: {
//         value: null,
//         error: false,
//         errorText: 'Date cannot be empty',
//     },
//     startTime: {
//         value: '',
//         error: false,
//         errorText: 'Start time cannot be empty',
//     },
//     endTime: {
//         value: '',
//         error: false,
//         errorText: 'End time cannot be empty',
//     },
//     notes: {
//         value: '',
//         error: false,
//         errorText: 'Notes cannot be empty',
//     },
// })

// export function mapEventToForm(event: EventBooking): FormFields {
//     const formFields = getEmptyFormValues()

//     formFields.contactName.value = event.contactName
//     formFields.contactNumber.value = event.contactNumber
//     formFields.contactEmail.value = event.contactEmail
//     formFields.organisation.value = event.organisation
//     formFields.location.value = event.location
//     formFields.date.value = event.startTime
//     formFields.startTime.value = event.startTime.toLocaleTimeString()
//     formFields.endTime.value = event.endTime.toLocaleTimeString()
//     formFields.notes.value = event.notes

//     return formFields
// }
