import {
    ScienceEnrolment,
    PaidHolidayProgramBooking,
    Booking,
    HolidayProgramBooking,
    Employee,
    FirestoreBooking,
} from 'fizz-kidz'
import { db } from '../init'

export type Collection<T> = FirebaseFirestore.CollectionReference<T>
export type Document<T> = FirebaseFirestore.DocumentReference<T>

export class FirestoreRefs {
    static partyBookings() {
        return db.collection('bookings') as Collection<FirestoreBooking>
    }

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
        return db.collection('scienceAppointments') as Collection<ScienceEnrolment>
    }

    static scienceEnrolment(appointmentId: string) {
        return this.scienceEnrolments().doc(appointmentId)
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
