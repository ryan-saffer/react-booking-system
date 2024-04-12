import type {
    AfterSchoolEnrolment,
    PaidHolidayProgramBooking,
    Booking,
    Employee,
    FirestoreBooking,
    RecursivePartial,
    Event,
    IncursionEvent,
    DiscountCode,
    Invitation,
    WithoutId,
    LocationOrMaster,
    AuthUser,
} from 'fizz-kidz'
import { FirestoreRefs, Document } from './FirestoreRefs'
import { Timestamp, type DocumentReference, Query, FieldValue } from 'firebase-admin/firestore'
import { CreateEvent } from '../events/core/create-event'
import { DateTime } from 'luxon'
import { midnight } from '../utilities'

type CreateDocOptions<T> = {
    ref?: Document<T>
}

export type UpdateDoc<T> = {
    [P in keyof T]?: T[P] extends number ? UpdateDoc<T[P]> | FieldValue : UpdateDoc<T[P]>
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

    async #getDocuments<T>(query: Query<T>) {
        const snap = await query.get()
        return Promise.all(snap.docs.map((doc) => this.#convertTimestamps(doc.data())))
    }

    async #updateDocument<T>(refPromise: Promise<Document<T>> | Document<T>, data: UpdateDoc<T>) {
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

    getAfterSchoolEnrolment(appointmentId: string) {
        return this.#getDocument(FirestoreRefs.afterSchoolEnrolment(appointmentId))
    }

    updateAfterSchoolEnrolment(appointmentId: string, data: RecursivePartial<AfterSchoolEnrolment>) {
        return this.#updateDocument(FirestoreRefs.afterSchoolEnrolment(appointmentId), data)
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

    async getEventSlots(eventId: string) {
        const slotsRef = await FirestoreRefs.eventSlots(eventId)
        return this.#getDocuments(slotsRef)
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

    /**
     * Gets all event slots between now and the given date.
     *
     * @param date
     */
    async getIncursionsBefore(date: DateTime) {
        const eventSlotsCollectionGroupRef = await FirestoreRefs.eventSlots()
        const slots = await this.#getDocuments(
            eventSlotsCollectionGroupRef
                .where('$type', '==', 'incursion')
                .where('startTime', '>', new Date())
                .where('startTime', '<', date.toJSDate())
        )
        return slots as IncursionEvent[]
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

    createInvitation(ref: DocumentReference<Invitation>, date: Date) {
        return this.#createDocument(
            {
                date,
                claimedDiscountCode: [],
            },
            ref
        )
    }

    async addGuestToInvitation(person: Invitation['claimedDiscountCode'][number], invitationId: string) {
        const ref = await FirestoreRefs.invitation(invitationId)
        await ref.update({ claimedDiscountCode: FieldValue.arrayUnion({ name: person.name, email: person.email }) })
    }

    async getInvitationGuestsOnDay(date: DateTime) {
        const start = midnight(date)
        const end = start.plus({ days: 1 })

        const ref = await FirestoreRefs.invitations()
        const query = ref.where('date', '>=', start.toJSDate()).where('date', '<=', end.toJSDate())

        return this.#getDocuments(query)
    }

    async createDiscountCode(discountCode: WithoutId<DiscountCode>) {
        return this.#createDocument(discountCode, (await FirestoreRefs.discountCodes()).doc())
    }

    async checkDiscountCode(code: string) {
        const collection = await FirestoreRefs.discountCodes()
        return this.#getDocuments(collection.where('code', '==', code))
    }

    async updateDiscountCode(code: string, discountCode: UpdateDoc<DiscountCode>) {
        const collection = await FirestoreRefs.discountCodes()
        const snap = await collection.where('code', '==', code).get()
        if (snap.docs.length > 0) {
            // guaranteed only one of each code - see 'createDiscountCode()'
            const existingCode = snap.docs[0].data()
            this.#updateDocument(FirestoreRefs.discountCode(existingCode.id), discountCode)
        }
    }

    async createUser(uid: string, user: AuthUser) {
        return (await FirestoreRefs.users()).doc(uid).set(user)
    }

    async updateUser(uid: string, user: RecursivePartial<AuthUser>) {
        const userRef = await FirestoreRefs.user(uid)
        return userRef.set(user, { merge: true })
    }

    async getUser(uid: string) {
        return (await (await FirestoreRefs.user(uid)).get()).data()
    }

    async getUsersByStudio(studio: LocationOrMaster) {
        const collection = await FirestoreRefs.users()
        const snap = await collection.where('accountType', '==', 'staff').get()
        return snap.docs
            .map((it) => it.data())
            .filter((user) => {
                return user.accountType === 'staff' && user.roles && Object.keys(user.roles).includes(studio)
            })
    }
}

const DatabaseClient = new Client()
export { DatabaseClient }
