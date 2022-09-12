import * as functions from 'firebase-functions'
import { AcuityClient } from '../../acuity/AcuityClient'
import { onCall } from '../../utilities'
import { db, storage } from '../../init'
import { ScheduleScienceAppointmentParams, ScienceAppointment } from 'fizz-kidz'

const projectName = JSON.parse(process.env.FIREBASE_CONFIG).projectId

export const scheduleScienceAppointment = onCall<'scheduleScienceAppointment'>(
    async (input: ScheduleScienceAppointmentParams, _context: functions.https.CallableContext) => {
        try {
            // create a firestore document
            const newDoc = db.collection('scienceAppointments').doc()

            // if an apaphylaxis plan was uploaded, move it into a directory under this booking
            // this will avoid files named the same thing from overwriting each other
            if (input.anaphylaxisPlan) {
                try {
                    await storage
                        .bucket(`${projectName}.appspot.com`)
                        .file(input.anaphylaxisPlan)
                        .move(`anaphylaxisPlans/${newDoc.id}/${input.anaphylaxisPlan}`)
                } catch (err) {
                    throw new functions.https.HttpsError('internal', 'error moving anaphylaxis plan', err)
                }
            }

            // schedule into all appointments of the program, along with the document id
            const acuityClient = new AcuityClient()
            const { appointments, price } = await acuityClient.scheduleScienceProgram(input, newDoc.id)

            // save all details, including all appointment ids, into firestore
            let appointment: ScienceAppointment = {
                ...input,
                id: newDoc.id,
                appointments: appointments,
                price: price,
                status: 'active',
                continuingWithTerm: '',
                continuingEmailSent: false,
                invoiceId: '',
                notes: '',
            }

            await newDoc.set({ ...appointment })
        } catch (err) {
            throw new functions.https.HttpsError('internal', 'error schedulding into science program', err)
        }
    }
)
