import { Acuity, ScienceEnrolment } from 'fizz-kidz'
import { FirestoreRefs } from './FirestoreRefs'
import HolidayProgramBooking = Acuity.Client.HolidayProgramBooking

class Client {
    getHolidayProgramBooking(paymentIntentId: string) {
        return FirestoreRefs.holidayProgramBooking(paymentIntentId).get()
    }

    updateHolidayProgramBooking(paymentIntentId: string, data: { booked: boolean }) {
        return FirestoreRefs.holidayProgramBooking(paymentIntentId).update(data)
    }

    getHolidayPrograms(paymentIntentId: string) {
        return FirestoreRefs.holidayPrograms(paymentIntentId).get()
    }

    updateHolidayProgram(paymentIntentId: string, documentId: string, data: Partial<HolidayProgramBooking>) {
        return FirestoreRefs.holidayProgram(paymentIntentId, documentId).update(data)
    }

    getScienceEnrolment(appointmentId: string) {
        return FirestoreRefs.scienceEnrolment(appointmentId).get()
    }

    updateScienceEnrolment(appointmentId: string, data: Partial<ScienceEnrolment>) {
        return FirestoreRefs.scienceEnrolment(appointmentId).update(data)
    }
}

const FirestoreClient = new Client()
export { FirestoreClient }
