import { CollectionGroup } from 'firebase-admin/firestore'
import type {
    AfterSchoolEnrolment,
    AuthUser,
    Booking,
    DiscountCode,
    Employee,
    Event,
    FirestoreBooking,
    HolidayProgramBooking,
    Invitation,
    PaidHolidayProgramBooking,
    ZohoAccessToken,
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

    /**
     * Not used just for holiday programs, but other acuity programs as well, such as studio opening sessions.
     * Since it's essentially the exact same thing but just with a different appointmentTypeId, reusing
     * holiday programs is much simpler, and renaming it was too much hastle.
     */
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
            'afterSchoolEnrolments'
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

    static async invitations() {
        return (await FirestoreClient.getInstance()).collection('invitations') as Collection<Invitation>
    }

    static async invitation(id: string) {
        return (await this.invitations()).doc(id)
    }

    static async discountCodes() {
        return (await FirestoreClient.getInstance()).collection('discountCodes') as Collection<DiscountCode>
    }

    static async discountCode(id: string) {
        return (await this.discountCodes()).doc(id)
    }

    static async users() {
        return (await FirestoreClient.getInstance()).collection('users') as Collection<AuthUser>
    }

    static async user(uid: string) {
        return (await this.users()).doc(uid)
    }

    static async zohoAccessToken() {
        return (await FirestoreClient.getInstance()).doc('accessTokens/zoho') as Document<ZohoAccessToken>
    }
}
