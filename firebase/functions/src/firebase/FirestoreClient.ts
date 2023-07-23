import { EventBooking } from 'fizz-kidz/src/partyBookings/Event'
import { ScienceEnrolment, PaidHolidayProgramBooking, Booking, Employee, FirestoreBooking } from 'fizz-kidz'
import { WithoutId } from 'fizz-kidz/src/utilities'
import { FirestoreRefs, Document, Collection } from './FirestoreRefs'
import { firestore } from 'firebase-admin'

type CreateDocProps<T> = {
    doc: WithoutId<T>
    ref?: firestore.DocumentReference<T>
}

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
            const value = data[key]
            if (!value) return
            if (typeof value === 'object') {
                data[key] = this.convertTimestamps(value)
            }
            if (value instanceof firestore.Timestamp) {
                data[key] = value.toDate()
            }
        })
        return data
    }

    /**
     * Create a firestore document. If `options.includeId` is used, it will add the id as part of the document.
     *
     * @returns the document id
     */
    private async _createDocument(
        doc: any,
        ref: firestore.DocumentReference<any>,
        options: { includeId?: boolean } = { includeId: true }
    ) {
        if (options.includeId) {
            await ref.set({ id: ref.id, ...doc })
        } else {
            await ref.set(doc)
        }
        return ref.id
    }

    async createPartyBooking(booking: FirestoreBooking) {
        return this._createDocument(booking, FirestoreRefs.partyBookings().doc(), { includeId: false })
    }

    getPartyBooking(bookingId: string) {
        return this._getDocument(FirestoreRefs.partyBooking(bookingId))
    }

    updatePartyBooking(bookingId: string, booking: Partial<Booking>) {
        return this._updateDocument(FirestoreRefs.partyBooking(bookingId), booking)
    }

    deletePartyBooking(bookingId: string) {
        return FirestoreRefs.partyBooking(bookingId).delete()
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
        return this._createDocument(booking, FirestoreRefs.events().doc())
    }

    updateEventBooking(eventId: string, booking: Partial<EventBooking>) {
        return this._updateDocument(FirestoreRefs.event(eventId), booking)
    }

    deleteEventBooking(eventId: string) {
        return FirestoreRefs.event(eventId).delete()
    }

    deleteEmployee(employeeId: string) {
        return FirestoreRefs.employee(employeeId).delete()
    }

    createEmployeeRef() {
        return FirestoreRefs.employees().doc()
    }

    createEmployee(props: CreateDocProps<Employee>) {
        return this._createDocument(props.doc, props.ref ?? FirestoreRefs.employees().doc())
    }

    getEmployee(employeeId: string) {
        return this._getDocument(FirestoreRefs.employee(employeeId))
    }

    updateEmployee(employeeId: string, employee: Partial<Employee>) {
        return FirestoreRefs.employee(employeeId).update(employee)
    }
}

const FirestoreClient = new Client()
export { FirestoreClient }
