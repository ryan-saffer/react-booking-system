import type {
    ScienceEnrolment,
    PaidHolidayProgramBooking,
    Booking,
    HolidayProgramBooking,
    Employee,
    FirestoreBooking,
} from 'fizz-kidz'
import { getDb } from '../init'

export type Collection<T> = FirebaseFirestore.CollectionReference<T>
export type Document<T> = FirebaseFirestore.DocumentReference<T>

export class FirestoreRefs {
    static async partyBookings() {
        return (await getDb()).collection('bookings') as Collection<FirestoreBooking>
    }

    static async partyBooking(id: string) {
        return (await getDb()).collection('bookings').doc(id) as Document<Booking>
    }

    static async holidayProgramBooking(paymentIntentId: string) {
        return (await getDb())
            .collection('holidayProgramBookings')
            .doc(paymentIntentId) as Document<HolidayProgramBooking>
    }

    static async holidayPrograms(paymentIntentId: string) {
        return (await this.holidayProgramBooking(paymentIntentId)).collection(
            'programs'
        ) as Collection<PaidHolidayProgramBooking>
    }

    static async holidayProgram(paymentIntentId: string, documentId: string) {
        return (await this.holidayPrograms(paymentIntentId)).doc(documentId)
    }

    static async scienceEnrolments() {
        return (await getDb()).collection('scienceAppointments') as Collection<ScienceEnrolment>
    }

    static async scienceEnrolment(appointmentId: string) {
        return (await this.scienceEnrolments()).doc(appointmentId)
    }

    static async events() {
        return (await getDb()).collection('events')
    }

    static async event(eventId: string) {
        return (await this.events()).doc(eventId)
    }

    static async employees() {
        return (await getDb()).collection('employees') as Collection<Employee>
    }

    static async employee(employeeId: string) {
        return (await this.employees()).doc(employeeId)
    }
}
