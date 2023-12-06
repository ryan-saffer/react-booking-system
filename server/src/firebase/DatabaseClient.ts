import type {
    ScienceEnrolment,
    PaidHolidayProgramBooking,
    Booking,
    Employee,
    FirestoreBooking,
    RecursivePartial,
    Event,
} from 'fizz-kidz'
import { FirestoreRefs, Document } from './FirestoreRefs'
import { Timestamp, type DocumentReference } from 'firebase-admin/firestore'
import { CreateEvent } from '../events/core/create-event'

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
        const data = snap.data()
        if (data) {
            return this.#convertTimestamps<T>(data)
        } else {
            throw new Error(`Cannot find document at path '${ref.path}' with id '${ref.id}'`)
        }
    }

    async #updateDocument<T>(refPromise: Promise<Document<T>> | Document<T>, data: RecursivePartial<T>) {
        const ref = await refPromise
        return ref.set(data as any, { merge: true })
    }

    /**
     * Converts all firebase timestamps to javascript dates, including nested fields.
     */
    #convertTimestamps<T>(obj: T): Promise<T> {
        const data = obj as any
        Object.keys(data).forEach((key) => {
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

    async createEventBooking(event: CreateEvent['event'], slots: CreateEvent['slots']) {
        // create root doc
        const eventId = (await FirestoreRefs.events()).doc().id
        await this.#createDocument({}, await FirestoreRefs.event(eventId))
        // add each slot within this doc
        const slotIds = await Promise.all(
            slots.map(async (slot) =>
                this.#createDocument(
                    {
                        ...event,
                        ...slot,
                        eventId,
                    },
                    (await FirestoreRefs.event(eventId)).collection('eventSlots').doc()
                )
            )
        )

        return { eventId, slotIds }
    }

    /**
     * Given an event id, returns the first slot of the event.
     * This can be used to then update the slot, using {@link updateEventBooking()}, which in turn will update all other slots.
     *
     * @param eventId the id of the event (not the slotId)
     */
    async getFirstEventSlot(eventId: string) {
        const eventSlotsRef = await FirestoreRefs.eventSlots(eventId)
        const slots = await eventSlotsRef.get()
        if (slots.docs.length > 0) {
            return slots.docs[0].data()
        } else {
            throw new Error(`No slots found for event with id: '${eventId}'`)
        }
    }

    async updateEventBooking(eventId: string, slotId: string, event: RecursivePartial<Event>) {
        // first update this event
        await this.#updateDocument(FirestoreRefs.eventSlot(eventId, slotId), event)

        // then update all siblings, except for the id, times and calendarEventId
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, startTime, endTime, calendarEventId, ...rest } = event
        const slots = await (await FirestoreRefs.eventSlots(eventId)).get()
        const siblings = slots.docs.filter((it) => it.id !== slotId)
        await Promise.all(
            siblings.map((doc) => this.#updateDocument(FirestoreRefs.eventSlot(eventId, doc.data().id), rest))
        )

        // return all siblings, so calendar events for each sibling can be updated
        return siblings.map((it) => {
            const data = it.data()
            const startTimeAsDate = (data.startTime as unknown as Timestamp).toDate()
            const endTimeAsDate = (data.endTime as unknown as Timestamp).toDate()
            return {
                ...data,
                startTime: startTimeAsDate,
                endTime: endTimeAsDate,
            }
        })
    }

    async deleteEventBooking(eventId: string, slotId: string) {
        // if its the last slot, delete the entire event
        const eventRef = await FirestoreRefs.event(eventId)
        const slotsRef = await FirestoreRefs.eventSlots(eventId)
        const slots = await slotsRef.get()
        const isLastSlot = slots.docs.length === 1

        const slotRef = await FirestoreRefs.eventSlot(eventId, slotId)
        await slotRef.delete()

        if (isLastSlot) {
            await eventRef.delete()
        }
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

const DatabaseClient = new Client()
export { DatabaseClient }
