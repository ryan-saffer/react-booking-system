export interface Appointment {
    id: number,
    email: string,
    firstName: string,
    lastName: string,
    phone: string,
    appointmentTypeID: number,
    classID: number,
    type: string,
    price: string,
    labels: Label[],
    forms: Form[],
    notes: string,
    calendar: string,
    paid: "yes" | "no",
    location: string,
    datetime: string,
    confirmationPage: string
    certificate: string
}

export interface MergedAppointment extends Appointment {
    checkoutPerson: string,
    checkoutTime: string,
}

export interface Label {
    id: number,
    name: string
}

export interface AppointmentType {
    id: number,
    name: string,
    description: string,
    category: string,
    calendarIDs: number[]
}

export interface Form {
    id: number,
    name: string,
    values: Array<FormValue>
}

export interface FormValue {
    id: number,
    fieldID: number,
    value: string,
    name: string
}

export interface Error {
    status_code: number,
    message: string,
    error: string
}

export interface Payment {
    transactionID: string
}

export type Class = {
    id: number
    calendarID: number
    calendar: string
    slotsAvailable: number
    time: string
}

export type Certificate = {
    discountType: 'percentage' | 'price'
    discountAmount: number
    certificate: string
}

export type Calendar = {
    id: number
    name: string
    location: string
    description: string
}