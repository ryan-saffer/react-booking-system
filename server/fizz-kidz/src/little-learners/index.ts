import type { StudioOrTest } from '../core/studio'
import type { InvoiceStatusMap } from '../after-school-program/invoicing'

export type CreateLittleLearnersEnrolmentParams = Pick<
    LittleLearnersEnrolment,
    'appointmentTypeId' | 'calendarId' | 'parent' | 'child' | 'emergencyContact' | 'className' | 'joinMailingList'
>

export type GetLittleLearnersEnrolmentParams = {
    id: string
}

export type ListLittleLearnersEnrolmentsParams = {
    appointmentTypeId: number
    includeInactive?: boolean
}

export type UpdateLittleLearnersEnrolmentParams = {
    id: string
} & Partial<LittleLearnersEnrolment>

export type RetrieveLittleLearnersInvoiceStatusesParams = {
    enrolmentIds: string[]
}

export type SendLittleLearnersInvoiceParams = {
    id: string
    numberOfWeeks: number
}

export type UnenrollLittleLearnersParams = {
    enrolmentIds: string[]
}

export type LittleLearnersSignature = {
    pickupPerson: string
    timestamp: number
    signature: string
    staffReason: string
}

export type LittleLearnersEnrolment = {
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
        [key: number]: LittleLearnersSignature | ''
    }
    joinMailingList: boolean
}

export type LittleLearnersInvoiceStatusMap = InvoiceStatusMap
