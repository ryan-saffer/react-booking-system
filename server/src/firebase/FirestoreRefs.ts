import { CollectionGroup } from 'firebase-admin/firestore'
import type {
    AfterSchoolEnrolment,
    Booking,
    Employee,
    Event,
    FirestoreBooking,
    HolidayProgramBooking,
    PaidHolidayProgramBooking,
} from 'fizz-kidz'

import { FirestoreClient } from './FirestoreClient'

export type Collection<T> = FirebaseFirestore.CollectionReference<T>
export type Document<T> = FirebaseFirestore.DocumentReference<T>

export class FirestoreRefs {
    static async partyBookings() {
        return (await FirestoreClient.getInstance()).collection('bookings') as Collection<FirestoreBooking>
    }

    static async partyBooking(id: string) {
        return (await FirestoreClient.getInstance()).collection('bookings').doc(id) as Document<Booking>
    }

    static async holidayProgramBooking(paymentIntentId: string) {
        return (await FirestoreClient.getInstance())
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

    static async afterSchoolEnrolments() {
        return (await FirestoreClient.getInstance()).collection(
            'scienceAppointments'
        ) as Collection<AfterSchoolEnrolment>
    }

    static async afterSchoolEnrolment(appointmentId: string) {
        return (await this.afterSchoolEnrolments()).doc(appointmentId)
    }

    static async events() {
        return (await FirestoreClient.getInstance()).collection('events')
    }

    static async event(eventId: string) {
        return (await this.events()).doc(eventId) as Document<{ id: string }>
    }

    /**
     * All event slots for a given event
     * @param eventId the id of the event
     */
    static async eventSlots(eventId: string): Promise<Collection<Event>>
    /**
     * Returns a collection reference to the 'eventSlots' collectionGroup
     */
    static async eventSlots(): Promise<CollectionGroup<Event>>
    static async eventSlots(eventId?: string) {
        if (eventId) {
            const eventsRef = await this.events()
            return eventsRef.doc(eventId).collection('eventSlots')
        } else {
            const client = await FirestoreClient.getInstance()
            return client.collectionGroup('eventSlots')
        }
    }

    static async eventSlot(eventId: string, slotId: string) {
        return (await this.eventSlots(eventId)).doc(slotId)
    }

    static async employees() {
        return (await FirestoreClient.getInstance()).collection('employees') as Collection<Employee>
    }

    static async employee(employeeId: string) {
        return (await this.employees()).doc(employeeId)
    }
}
