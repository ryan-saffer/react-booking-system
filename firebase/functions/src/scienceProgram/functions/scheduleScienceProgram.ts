import * as functions from 'firebase-functions'
import { AcuityClient } from '../../acuity/AcuityClient'
import { onCall } from '../../utilities'
import { db } from '../../index'
import { ScheduleScienceAppointmentParams, ScienceAppointment } from 'fizz-kidz'

export const scheduleScienceAppointment = onCall<'scheduleScienceAppointment'>(
    async (input: ScheduleScienceAppointmentParams, _context: functions.https.CallableContext) => {
        // create a firestore document
        const newDoc = db.collection('scienceAppointments').doc()

        // schedule into all appointments of the program, along with the document id
        const acuityClient = new AcuityClient()
        const { appointments, price } = await acuityClient.scheduleScienceProgram(input, newDoc.id)

        // save all details, including all appointment ids, into firestore
        let appointment: ScienceAppointment = {
            ...input,
            id: newDoc.id,
            appointments: appointments,
            price: price,
            status: 'enrolled',
            continuingWithTerm: '',
            continuingEmailSent: false,
            invoiceId: '',
            notes: ''
        }

        await newDoc.set({ ...appointment })
    }
)
