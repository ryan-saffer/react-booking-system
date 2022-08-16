import * as functions from 'firebase-functions'
import { AcuityClient } from '../../acuity/AcuityClient'
import { onCall } from '../../utilities'
import { db } from '../../index'
import { ScheduleScienceAppointmentParams } from 'fizz-kidz/src'

export const scheduleScienceAppointment = onCall<'scheduleScienceAppointment'>(
    async (input: ScheduleScienceAppointmentParams, _context: functions.https.CallableContext) => {
        const {
            parentFirstName,
            parentLastName,
            parentEmail,
            parentPhone,
            childName,
            childAge,
            childGrade,
            appointmentTypeId,
        } = input

        // create a firestore document
        const newDoc = db.collection('scienceAppointments').doc()
        const firestoreId = newDoc.id

        // schedule into all appointments of the program, along with the document id
        const acuityClient = new AcuityClient()
        const appointments = await acuityClient.scheduleScienceProgram(input, firestoreId)

        // save all details, including all appointment ids, into firestore
        await newDoc.set({
            parentFirstName,
            parentLastName,
            parentEmail,
            parentPhone,
            childName,
            childAge,
            childGrade,
            appointmentTypeId,
            appointments,
        })
    }
)
