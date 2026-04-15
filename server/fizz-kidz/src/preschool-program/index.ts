import type { StudioOrTest } from '../core/studio'
import type { InvoiceStatusMap } from '../after-school-program/invoicing'

export type CreatePreschoolProgramEnrolmentParams = Pick<
    PreschoolProgramEnrolment,
    'appointmentTypeId' | 'calendarId' | 'parent' | 'child' | 'emergencyContact' | 'className' | 'joinMailingList'
>

export type GetPreschoolProgramEnrolmentParams = {
    id: string
}

export type ListPreschoolProgramEnrolmentsParams = {
    appointmentTypeId: number
    includeInactive?: boolean
}

export type UpdatePreschoolProgramEnrolmentParams = {
    id: string
} & Partial<PreschoolProgramEnrolment>

export type RetrievePreschoolProgramInvoiceStatusesParams = {
    enrolmentIds: string[]
}

export type SendPreschoolProgramInvoiceParams = {
    id: string
    numberOfWeeks: number
}

export type UnenrollPreschoolProgramParams = {
    enrolmentIds: string[]
}

export type PreschoolProgramSignature = {
    pickupPerson: string
    timestamp: number
    signature: string
    staffReason: string
}

export type PreschoolProgramEnrolment = {
    id: string
    status: 'active' | 'inactive'
    appointmentTypeId: number
    calendarId: number
    studio: StudioOrTest
    appointments: number[]
    className: string
    price: string
    parent: {
        firstName: string
        lastName: string
        email: string
        phone: string
    }
    child: {
        firstName: string
        lastName: string
        dob: string
        allergies: string
        additionalInfo: string
    }
    emergencyContact: {
        name: string
        relation: string
        phone: string
    }
    invoiceId: string
    notes: string
    createdAt: Date
    updatedAt: Date
    signatures: {
        [key: number]: PreschoolProgramSignature | ''
    }
    joinMailingList: boolean
}

export type PreschoolProgramInvoiceStatusMap = InvoiceStatusMap
