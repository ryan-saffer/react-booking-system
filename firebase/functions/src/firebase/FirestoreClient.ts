import { EventBooking } from 'fizz-kidz/src/partyBookings/Event'
import { ScienceEnrolment, PaidHolidayProgramBooking, Booking, Employee, FirestoreBooking } from 'fizz-kidz'
import { RecursivePartial, WithoutId } from 'fizz-kidz/src/utilities'
import { FirestoreRefs, Document } from './FirestoreRefs'
import { firestore } from 'firebase-admin'

type CreateDocOptions<T> = {
    ref?: Document<T>
}

class Client {
    /**
     * Create a firestore document, where the document id will be added to the document as `id`
     *
     * @returns the document id
     */
    async #createDocument(doc: any, ref: firestore.DocumentReference<any>) {
        await ref.set({ id: ref.id, ...doc })
        return ref.id
    }

    async #getDocument<T>(ref: Document<T>) {
        const snap = await ref.get()
        if (snap.exists) {
            return this.#convertTimestamps<T>(snap.data() as T)
        } else {
            throw new Error(`Cannot find document at path '${ref.path}' with id '${ref.id}'`)
        }
    }

    #updateDocument<T>(ref: Document<T>, data: RecursivePartial<T>) {
        return ref.set(data as any, { merge: true })
    }

    /**
     * Converts all firebase timestamps to javascript dates, including nested fields.
     */
    #convertTimestamps<T>(obj: T): T {
        const data = obj as any
        Object.keys(data).forEach((key) => {
            const value = data[key]
            if (!value) return
            if (typeof value === 'object') {
                data[key] = this.#convertTimestamps(value)
            }
            if (value instanceof firestore.Timestamp) {
                data[key] = value.toDate()
            }
        })
        return data
    }

    async createPartyBooking(booking: FirestoreBooking) {
        const ref = FirestoreRefs.partyBookings().doc()
        await ref.set(booking)
        return ref.id
    }

    getPartyBooking(bookingId: string) {
        return this.#getDocument(FirestoreRefs.partyBooking(bookingId))
    }

    updatePartyBooking(bookingId: string, booking: Partial<Booking>) {
        return this.#updateDocument(FirestoreRefs.partyBooking(bookingId), booking)
    }

    deletePartyBooking(bookingId: string) {
        return FirestoreRefs.partyBooking(bookingId).delete()
    }

    getHolidayProgramBooking(paymentIntentId: string) {
        return this.#getDocument(FirestoreRefs.holidayProgramBooking(paymentIntentId))
    }

    updateHolidayProgramBooking(paymentIntentId: string, data: { booked: boolean }) {
        return this.#updateDocument(FirestoreRefs.holidayProgramBooking(paymentIntentId), data)
    }

    getHolidayPrograms(paymentIntentId: string) {
        return FirestoreRefs.holidayPrograms(paymentIntentId).get()
    }

    updateHolidayProgram(paymentIntentId: string, documentId: string, data: Partial<PaidHolidayProgramBooking>) {
        return this.#updateDocument(FirestoreRefs.holidayProgram(paymentIntentId, documentId), data)
    }

    getScienceEnrolment(appointmentId: string) {
        return this.#getDocument(FirestoreRefs.scienceEnrolment(appointmentId))
    }

    updateScienceEnrolment(appointmentId: string, data: Partial<ScienceEnrolment>) {
        return this.#updateDocument(FirestoreRefs.scienceEnrolment(appointmentId), data)
    }

    async createEventBooking(booking: WithoutId<Omit<EventBooking, 'calendarEventId'>>) {
        return this.#createDocument(booking, FirestoreRefs.events().doc())
    }

    updateEventBooking(eventId: string, booking: RecursivePartial<EventBooking>) {
        return this.#updateDocument(FirestoreRefs.event(eventId), booking)
    }

    deleteEventBooking(eventId: string) {
        return FirestoreRefs.event(eventId).delete()
    }

    deleteEmployee(employeeId: string) {
        return FirestoreRefs.employee(employeeId).delete()
    }

    createEmployee(employee: Employee, options: CreateDocOptions<Employee>) {
        return this.#createDocument(employee, options.ref ?? FirestoreRefs.employees().doc())
    }

    getEmployee(employeeId: string) {
        return this.#getDocument(FirestoreRefs.employee(employeeId))
    }

    updateEmployee(employeeId: string, employee: Partial<Employee>) {
        return this.#updateDocument(FirestoreRefs.employee(employeeId), employee)
    }

    updateEmployeeContract(employeeId: string, signedUrl: string) {
        return this.#updateDocument(FirestoreRefs.employee(employeeId), {
            contract: {
                signed: true,
                signedUrl,
            },
        })
    }
}

const FirestoreClient = new Client()
export { FirestoreClient }
