import { ScienceEnrolment, PaidHolidayProgramBooking, Booking, HolidayProgramBooking, Employee } from 'fizz-kidz'
import { db } from '../init'

export type Collection<T> = FirebaseFirestore.CollectionReference<T>
export type Document<T> = FirebaseFirestore.DocumentReference<T>

export class FirestoreRefs {
    static partyBooking(id: string) {
        return db.collection('bookings').doc(id) as Document<Booking>
    }
    static holidayProgramBooking(paymentIntentId: string) {
        return db.collection('holidayProgramBookings').doc(paymentIntentId) as Document<HolidayProgramBooking>
    }
    static holidayPrograms(paymentIntentId: string) {
        return this.holidayProgramBooking(paymentIntentId).collection(
            'programs'
        ) as Collection<PaidHolidayProgramBooking>
    }

    static holidayProgram(paymentIntentId: string, documentId: string) {
        return this.holidayPrograms(paymentIntentId).doc(documentId)
    }

    static scienceEnrolments() {
        return db.collection('scienceAppointments')
    }

    static scienceEnrolment(appointmentId: string) {
        return this.scienceEnrolments().doc(appointmentId) as Document<ScienceEnrolment>
    }

    static events() {
        return db.collection('events')
    }

    static event(eventId: string) {
        return this.events().doc(eventId)
    }

    static employees() {
        return db.collection('employees') as Collection<Employee>
    }

    static employee(employeeId: string) {
        return this.employees().doc(employeeId)
    }
}
