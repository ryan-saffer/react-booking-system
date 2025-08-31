import express from 'express'
import { logger } from 'firebase-functions/v2'
import { AcuityConstants } from 'fizz-kidz'

import { checkInToCrm } from '@/holiday-programs/core/check-in-to-crm'
import { processHolidayProgramRefund } from '@/holiday-programs/core/process-holiday-program-refund'
import { processPlayLabRefund } from '@/play-lab/core/process-play-lab-refund'
import { logError } from '@/utilities'

import { AcuityClient } from '../core/acuity-client'

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

export const acuityWebhook = express.Router()

async function isPlayLab(appointmentTypeId: string) {
    const acuity = await AcuityClient.getInstance()
    const appointmentTypes = await acuity.getAppointmentTypes({ category: ['play-lab', 'play-lab-test'] })
    return appointmentTypes.some((appointmentType) => appointmentType.id.toString() === appointmentTypeId)
}

acuityWebhook.post('/acuity', async (req, resp) => {
    logger.log('STARTING WEBHOOK')
    logger.log(req.body)
    const data = req.body as AcuityWebhookData

    try {
        switch (data.action) {
            case 'canceled':
                // ONLY HOLIDAY PROGRAMS GET REFUNDED - CURRENTLY OTHER PROGRAMS NOT SUPPORTED (ie kingsville opening)
                if (isHolidayProgram(data.appointmentTypeID)) {
                    await processHolidayProgramRefund(data)
                    resp.status(200).send()
                    return
                } else if (await isPlayLab(data.appointmentTypeID)) {
                    await processPlayLabRefund(data)
                    resp.status(200).send()
                    return
                } else {
                    logger.log('ignoring cancelled program with id:', data.appointmentTypeID)
                    resp.status(200).send()
                    return
                }
            case 'changed':
                // ONLY HOLIDAY PROGRAMS CHECK IN TO CRM - CURRENTLY OTHER PROGRAMS NOT SUPPORTED (ie kingsville opening)
                if (isHolidayProgram(data.appointmentTypeID)) {
                    await checkInToCrm(data)
                    resp.status(200).send()
                    return
                } else {
                    logger.log('ignoring changed program with id:', data.appointmentTypeID)
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
