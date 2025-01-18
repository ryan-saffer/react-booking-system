import { logger } from 'firebase-functions/v2'
import { onRequest } from 'firebase-functions/v2/https'
import { AcuityConstants } from 'fizz-kidz'

import { cancelHolidayProgram } from '../../holiday-programs/core/cancel-holiday-program'
import { logError } from '../../utilities'

export type AcuityWebhookData = {
    action: 'scheduled' | 'rescheduled' | 'canceled' | 'changed' | 'order.completed'
    id: string
    calendarID: string
    appointmentTypeID: string
}

function isHolidayProgram(appointmentTypeId: string) {
    return (
        appointmentTypeId === AcuityConstants.AppointmentTypes.HOLIDAY_PROGRAM.toString() ||
        appointmentTypeId === AcuityConstants.AppointmentTypes.TEST_HOLIDAY_PROGRAM.toString()
    )
}

export const asWebhook = onRequest(async (req, resp) => {
    logger.log('STARTING WEBHOOK')
    logger.log(req.body)
    const data = req.body as AcuityWebhookData

    try {
        switch (data.action) {
            case 'canceled':
                if (isHolidayProgram(data.appointmentTypeID)) {
                    await cancelHolidayProgram(data)
                    resp.status(200).send()
                    return
                } else {
                    logger.log('ignoring cancelled program with id:', data.appointmentTypeID)
                    resp.status(200).send()
                    return
                }
            default:
                logger.log(`Ignoring action: ${data.action}`)
                resp.status(200).send()
                return
        }
    } catch (error) {
        logError('error running acuity webhook', error)
        resp.status(500).send(error)
        return
    }
})
