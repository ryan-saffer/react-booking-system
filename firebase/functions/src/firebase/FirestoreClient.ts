import type {
    ScienceEnrolment,
    PaidHolidayProgramBooking,
    Booking,
    Employee,
    FirestoreBooking,
    RecursivePartial,
    WithoutId,
    EventBooking,
} from 'fizz-kidz'
import { FirestoreRefs, Document } from './FirestoreRefs'
import type { DocumentReference } from 'firebase-admin/firestore'

type CreateDocOptions<T> = {
    ref?: Document<T>
}

class Client {
    /**
     * Create a firestore document, where the document id will be added to the document as `id`
     *
     * @returns the document id
     */
    async #createDocument(doc: any, ref: DocumentReference<any>) {
        await ref.set({ id: ref.id, ...doc })
        return ref.id
    }

    async #getDocument<T>(refPromise: Promise<Document<T>>) {
        const ref = await refPromise
        const snap = await ref.get()
        if (snap.exists) {
            return this.#convertTimestamps<T>(snap.data() as T)
        } else {
            throw new Error(`Cannot find document at path '${ref.path}' with id '${ref.id}'`)
        }
    }

    async #updateDocument<T>(refPromise: Promise<Document<T>>, data: RecursivePartial<T>) {
        const ref = await refPromise
        return ref.set(data as any, { merge: true })
    }

    /**
     * Converts all firebase timestamps to javascript dates, including nested fields.
     */
    async #convertTimestamps<T>(obj: T): Promise<T> {
        const data = obj as any
        const { Timestamp } = await import('firebase-admin/firestore')
        Object.keys(data).forEach(async (key) => {
            const value = data[key]
            if (!value) return
            if (typeof value === 'object') {
                data[key] = this.#convertTimestamps(value)
            }
            if (value instanceof Timestamp) {
                data[key] = value.toDate()
            }
        })
        return data
    }

    async createPartyBooking(booking: FirestoreBooking) {
        const ref = (await FirestoreRefs.partyBookings()).doc()
        await ref.set(booking)
        return ref.id
    }

    getPartyBooking(bookingId: string) {
        return this.#getDocument(FirestoreRefs.partyBooking(bookingId))
    }

    updatePartyBooking(bookingId: string, booking: Partial<Booking>) {
        return this.#updateDocument(FirestoreRefs.partyBooking(bookingId), booking)
    }

    async deletePartyBooking(bookingId: string) {
        return (await FirestoreRefs.partyBooking(bookingId)).delete()
    }

    updateHolidayProgramBooking(paymentIntentId: string, data: { booked: boolean }) {
        return this.#updateDocument(FirestoreRefs.holidayProgramBooking(paymentIntentId), data)
    }

    async getHolidayPrograms(paymentIntentId: string) {
        return (await FirestoreRefs.holidayPrograms(paymentIntentId)).get()
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
        return this.#createDocument(booking, (await FirestoreRefs.events()).doc())
    }

    updateEventBooking(eventId: string, booking: RecursivePartial<EventBooking>) {
        return this.#updateDocument(FirestoreRefs.event(eventId), booking)
    }

    async deleteEventBooking(eventId: string) {
        return (await FirestoreRefs.event(eventId)).delete()
    }

    async createEmployee(employee: Employee, options: CreateDocOptions<Employee>) {
        return this.#createDocument(employee, options.ref ?? (await FirestoreRefs.employees()).doc())
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
