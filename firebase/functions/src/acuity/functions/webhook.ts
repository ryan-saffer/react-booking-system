import * as functions from 'firebase-functions'
import { Acuity } from 'fizz-kidz'
import { cancelHolidayProgram } from '../../holidayPrograms/core/cancelHolidayProgram'

export type AcuityWebhookData = {
    action: 'scheduled' | 'rescheduled' | 'canceled' | 'changed' | 'order.completed'
    id: string
    calendarID: string
    appointmentTypeID: string
}

function isHolidayProgram(appointmentTypeId: string) {
    return (
        appointmentTypeId === Acuity.Constants.AppointmentTypes.HOLIDAY_PROGRAM.toString() ||
        appointmentTypeId === Acuity.Constants.AppointmentTypes.TEST_HOLIDAY_PROGRAM.toString()
    )
}

export const asWebhook = functions.region('australia-southeast1').https.onRequest(async (req, resp) => {
    console.log('STARTING WEBHOOK')
    console.log(req.body)
    let data = req.body as AcuityWebhookData

    try {
        switch (data.action) {
            case 'canceled':
                if (isHolidayProgram(data.appointmentTypeID)) {
                    await cancelHolidayProgram(data)
                    resp.status(200).send()
                    return
                } else {
                    console.log('ignoring cancelled program with id:', data.appointmentTypeID)
                    resp.status(200).send()
                    return
                }
            default:
                console.log(`Ignoring action: ${data.action}`)
                resp.status(200).send()
                return
        }
    } catch (error) {
        resp.status(500).send(error)
        return
    }
})
