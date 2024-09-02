import { FieldValue } from 'firebase-admin/firestore'
import { AcuityTypes, AcuityUtilities, FreeHolidayProgramBooking, PaidHolidayProgramBooking } from 'fizz-kidz'
import { DateTime } from 'luxon'

import { AcuityClient } from '../../acuity/core/acuity-client'
import { DatabaseClient } from '../../firebase/DatabaseClient'
import { FirestoreRefs } from '../../firebase/FirestoreRefs'
import { SheetsClient } from '../../google/SheetsClient'
import { logError } from '../../utilities'
import { ZohoClient } from '../../zoho/zoho-client'
import { bookHolidayProgramIntoAcuity } from './schedule-holiday-program-into-acuity'
import { sendConfirmationEmail } from './send-confirmation-email'

export async function bookHolidayPrograms(
    props:
        | {
              free: false
              paymentIntentId: string
          }
        | {
              free: true
              programs: FreeHolidayProgramBooking[]
          }
) {
    let appointments: AcuityTypes.Api.Appointment[] = []
    let paidPrograms: { program: PaidHolidayProgramBooking; id: string }[] = []

    if (!props.free) {
        // only paid programs have a document in firestore.
        // this is so the parent can subscribe to the document, and once it gets updated to 'booked',
        // they get shown a confirmation message on the booking page.
        const query = await (await FirestoreRefs.holidayProgramBooking(props.paymentIntentId)).get()

        if (query.exists && !query.get('booked')) {
            paidPrograms = (await DatabaseClient.getHolidayPrograms(props.paymentIntentId)).docs.map((doc) => ({
                program: doc.data(),
                id: doc.id,
            }))

            appointments = await Promise.all(
                paidPrograms.map(async ({ program, id }) => {
                    if (program.booked) {
                        const acuity = await AcuityClient.getInstance()
                        return acuity.getAppointment(program.appointmentId.toString())
                    }

                    const appointment = await bookHolidayProgramIntoAcuity(program, props.paymentIntentId)

                    await DatabaseClient.updateHolidayProgram(props.paymentIntentId, id, {
                        booked: true,
                        appointmentId: appointment.id,
                    })

                    return appointment
                })
            )

            await DatabaseClient.updateHolidayProgramBooking(props.paymentIntentId, { booked: true })
        }
    } else {
        // free program
        appointments = await Promise.all(props.programs.map((program) => bookHolidayProgramIntoAcuity(program)))
    }

    const programs = props.free ? props.programs : paidPrograms.map(({ program }) => program)

    // write to crm
    if (programs[0].joinMailingList) {
        const zohoClient = new ZohoClient()
        try {
            // cannot use `Promise.all()` here, since each child is added individually.
            // doing them concurrently writes each child into the same free slot, and overwrite each other.
            // the most ideal fix is to pass all children into the zoho client, and the client can handle multiple children at once..
            // but cbf for now.
            for (let i = 0; i < programs.length; i++) {
                const program = programs[i]
                await zohoClient.addHolidayProgramContact({
                    firstName: program.parentFirstName,
                    lastName: program.parentLastName,
                    email: program.parentEmail,
                    mobile: program.parentPhone,
                    studio: AcuityUtilities.getStudioByCalendarId(program.calendarId),
                    childName: program.childName,
                    childBirthdayISO: program.childAge,
                })
            }
        } catch (err) {
            logError(`unable to add holiday program booking to zoho with parent email ${programs[0].parentEmail}`, err)
        }
    }

    // write additional info to spreadsheet to contact parent
    const additionalNeedsPrograms = programs.filter((it) => it.childAdditionalInfo !== '')

    if (additionalNeedsPrograms.length > 0) {
        const sheetsClient = await SheetsClient.getInstance()
        sheetsClient.addRowToSheet(
            'holidayProgramAdditionalNeeds',
            additionalNeedsPrograms.map((program) => [
                appointments[0].calendar,
                program.dateTime,
                program.parentFirstName,
                program.parentLastName,
                program.parentEmail,
                program.parentPhone,
                program.childName,
                Math.abs(DateTime.fromISO(program.childAge).diffNow('years').years).toFixed(0),
                program.childAllergies,
                program.childAdditionalInfo,
            ])
        )
    }

    // send confirmation email
    await sendConfirmationEmail(appointments)

    // if using a discount code, update its number of uses
    const code = programs[0].discountCode
    if (code) {
        try {
            await DatabaseClient.updateDiscountCode(code, { numberOfUses: FieldValue.increment(1) })
        } catch (err) {
            logError('Error while updating discount code during holiday program registration', err, { code })
        }
    }
}
