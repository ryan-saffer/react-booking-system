import { EventBooking } from './../../fizz-kidz/src/booking/Event'
import { ScienceEnrolment, PaidHolidayProgramBooking, FirestoreBooking, Booking } from 'fizz-kidz'
import { FirestoreRefs } from './FirestoreRefs'
import { WithoutId } from 'fizz-kidz/src/utilities'

class Client {
    getPartyBooking(bookingId: string) {
        return FirestoreRefs.partyBooking(bookingId).get() as Promise<
            FirebaseFirestore.DocumentSnapshot<FirestoreBooking>
        >
    }

    updatePartyBooking(bookingId: string, booking: Partial<Booking>) {
        return FirestoreRefs.partyBooking(bookingId).set(booking, { merge: true })
    }

    getHolidayProgramBooking(paymentIntentId: string) {
        return FirestoreRefs.holidayProgramBooking(paymentIntentId).get()
    }

    updateHolidayProgramBooking(paymentIntentId: string, data: { booked: boolean }) {
        return FirestoreRefs.holidayProgramBooking(paymentIntentId).update(data)
    }

    getHolidayPrograms(paymentIntentId: string) {
        return FirestoreRefs.holidayPrograms(paymentIntentId).get()
    }

    updateHolidayProgram(paymentIntentId: string, documentId: string, data: Partial<PaidHolidayProgramBooking>) {
        return FirestoreRefs.holidayProgram(paymentIntentId, documentId).update(data)
    }

    getScienceEnrolment(appointmentId: string) {
        return FirestoreRefs.scienceEnrolment(appointmentId).get()
    }

    updateScienceEnrolment(appointmentId: string, data: Partial<ScienceEnrolment>) {
        return FirestoreRefs.scienceEnrolment(appointmentId).update(data)
    }

    async createEventBooking(booking: WithoutId<EventBooking>) {
        const ref = FirestoreRefs.events().doc()
        await ref.set({ id: ref.id, ...booking })
        return ref.id
    }
}

const FirestoreClient = new Client()
export { FirestoreClient }
