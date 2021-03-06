import FormFieldOptions from './constants/formFieldOptions'
import FormFields from './constants/formFields'
import Forms from './constants/forms'
import Labels from './constants/labels'

const Constants = {
    FormFieldOptions,
    FormFields,
    Forms,
    Labels
}

import * as Utilities from './utilities'

export type { 
    Appointment,
    MergedAppointment,
    Label,
    AppointmentType,
    Form,
    FormValue,
    Error
} from './types'

export {
    Constants,
    Utilities,
}

export * as Client from './client'