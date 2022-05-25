import FormFieldOptions from './constants/formFieldOptions'
import FormFields from './constants/formFields'
import Forms from './constants/forms'
import Labels from './constants/labels'
import AppointmentTypes from './constants/appointmentTypes'

const Constants = {
    FormFieldOptions,
    FormFields,
    Forms,
    Labels,
    AppointmentTypes
}

import * as Utilities from './utilities'

export type { 
    Appointment,
    MergedAppointment,
    Label,
    AppointmentType,
    Form,
    FormValue,
    Error,
    Payment
} from './types'

export {
    Constants,
    Utilities,
}

export * as Client from './client'