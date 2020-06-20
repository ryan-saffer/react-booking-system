declare namespace Acuity {
    
    export interface Appointment {
        id: number,
        email: string,
        firstName: string,
        lastName: string,
        phone: string,
        appointmentTypeID: number,
        type: string,
        forms: Form[]
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