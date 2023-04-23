import { EventBooking } from './../../fizz-kidz/src/booking/Event'
import { ScienceEnrolment, PaidHolidayProgramBooking, Booking } from 'fizz-kidz'
import { WithoutId } from 'fizz-kidz/src/utilities'
import { FirestoreRefs, Document } from './FirestoreRefs'

class Client {
    private async _getDocument<T>(ref: Document<T>) {
        const snap = await ref.get()
        if (snap.exists) {
            return this.convertTimestamps<T>(snap.data() as T)
        } else {
            throw new Error(`Cannot find document at path '${ref.path}' with id '${ref.id}'`)
        }
    }

    private _updateDocument<T>(ref: Document<T>, data: Partial<T>) {
        return ref.set(data as any, { merge: true })
    }

    /**
     * Converts all firebase timestamps to javascript dates, including nested fields.
     */
    private convertTimestamps<T>(obj: T): T {
        const data = obj as any
        Object.keys(data).forEach((key) => {
            if (typeof data[key] === 'object') {
                data[key] = this.convertTimestamps(data[key])
            }
            if (data[key] instanceof FirebaseFirestore.Timestamp) {
                data[key] = data[key].toDate()
            }
        })
        return data
    }

    getPartyBooking(bookingId: string) {
        return this._getDocument(FirestoreRefs.partyBooking(bookingId))
    }

    updatePartyBooking(bookingId: string, booking: Partial<Booking>) {
        return this._updateDocument(FirestoreRefs.partyBooking(bookingId), booking)
    }

    getHolidayProgramBooking(paymentIntentId: string) {
        return this._getDocument(FirestoreRefs.holidayProgramBooking(paymentIntentId))
    }

    updateHolidayProgramBooking(paymentIntentId: string, data: { booked: boolean }) {
        return this._updateDocument(FirestoreRefs.holidayProgramBooking(paymentIntentId), data)
    }

    getHolidayPrograms(paymentIntentId: string) {
        return FirestoreRefs.holidayPrograms(paymentIntentId).get()
    }

    updateHolidayProgram(paymentIntentId: string, documentId: string, data: Partial<PaidHolidayProgramBooking>) {
        return this._updateDocument(FirestoreRefs.holidayProgram(paymentIntentId, documentId), data)
    }

    getScienceEnrolment(appointmentId: string) {
        return this._getDocument(FirestoreRefs.scienceEnrolment(appointmentId))
    }

    updateScienceEnrolment(appointmentId: string, data: Partial<ScienceEnrolment>) {
        return this._updateDocument(FirestoreRefs.scienceEnrolment(appointmentId), data)
    }

    async createEventBooking(booking: WithoutId<Omit<EventBooking, 'calendarEventId'>>) {
        const ref = FirestoreRefs.events().doc()
        await ref.set({ id: ref.id, ...booking })
        return ref.id
    }

    updateEventBooking(eventId: string, booking: Partial<EventBooking>) {
        return this._updateDocument(FirestoreRefs.event(eventId), booking)
    }

    deleteEventBooking(eventId: string) {
        return FirestoreRefs.event(eventId).delete()
    }
}

const FirestoreClient = new Client()
export { FirestoreClient }
