import { EventBooking } from './../../fizz-kidz/src/booking/Event'
import { ScienceEnrolment, PaidHolidayProgramBooking, FirestoreBooking, Booking } from 'fizz-kidz'
import { WithoutId } from 'fizz-kidz/src/utilities'
import { FirestoreRefs } from './FirestoreRefs'

class Client {
    private refs: FirestoreRefs = new FirestoreRefs()

    getPartyBooking(bookingId: string) {
        return this.refs.partyBooking(bookingId).get() as Promise<FirebaseFirestore.DocumentSnapshot<FirestoreBooking>>
    }

    updatePartyBooking(bookingId: string, booking: Partial<Booking>) {
        return this.refs.partyBooking(bookingId).set(booking, { merge: true })
    }

    getHolidayProgramBooking(paymentIntentId: string) {
        return this.refs.holidayProgramBooking(paymentIntentId).get()
    }

    updateHolidayProgramBooking(paymentIntentId: string, data: { booked: boolean }) {
        return this.refs.holidayProgramBooking(paymentIntentId).update(data)
    }

    getHolidayPrograms(paymentIntentId: string) {
        return this.refs.holidayPrograms(paymentIntentId).get()
    }

    updateHolidayProgram(paymentIntentId: string, documentId: string, data: Partial<PaidHolidayProgramBooking>) {
        return this.refs.holidayProgram(paymentIntentId, documentId).update(data)
    }

    getScienceEnrolment(appointmentId: string) {
        return this.refs.scienceEnrolment(appointmentId).get()
    }

    updateScienceEnrolment(appointmentId: string, data: Partial<ScienceEnrolment>) {
        return this.refs.scienceEnrolment(appointmentId).update(data)
    }

    async createEventBooking(booking: WithoutId<Omit<EventBooking, 'calendarEventId'>>) {
        const ref = this.refs.events().doc()
        await ref.set({ id: ref.id, ...booking })
        return ref.id
    }

    updateEventBooking(eventId: string, booking: Partial<EventBooking>) {
        return this.refs.event(eventId).update(booking)
    }

    deleteEventBooking(eventId: string) {
        return this.refs.event(eventId).delete()
    }
}

const FirestoreClient = new Client()
export { FirestoreClient }
