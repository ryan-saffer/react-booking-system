import { ScienceEnrolment, PaidHolidayProgramBooking } from 'fizz-kidz'
import { db } from '../init'
type Collection<T> = FirebaseFirestore.CollectionReference<T>
type Document<T> = FirebaseFirestore.DocumentReference<T>

class Refs {
    partyBooking(id: string) {
        return db.collection('bookings').doc(id)
    }
    holidayProgramBooking(paymentIntentId: string) {
        return db.collection('holidayProgramBookings').doc(paymentIntentId)
    }
    holidayPrograms(paymentIntentId: string) {
        return this.holidayProgramBooking(paymentIntentId).collection(
            'programs'
        ) as Collection<PaidHolidayProgramBooking>
    }

    holidayProgram(paymentIntentId: string, documentId: string) {
        return this.holidayPrograms(paymentIntentId).doc(documentId)
    }

    private scienceEnrolments() {
        return db.collection('scienceAppointments')
    }

    scienceEnrolment(appointmentId: string) {
        return this.scienceEnrolments().doc(appointmentId) as Document<ScienceEnrolment>
    }
}

const FirestoreRefs = new Refs()
export { FirestoreRefs }
