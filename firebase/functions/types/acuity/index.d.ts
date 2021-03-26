declare namespace Acuity {
    
    export interface Appointment {
        id: number,
        email: string,
        firstName: string,
        lastName: string,
        phone: string,
        appointmentTypeID: number,
        type: string,
        labels: Label[],
        checkoutPerson: string,
        checkoutTime: string,
        forms: Form[],
        notes: string
    }

    export interface Label {
        id: number,
        name: string
    }

    export interface AppointmentType {
        id: number,
        name: string,
        category: string
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
}

export = Acuity