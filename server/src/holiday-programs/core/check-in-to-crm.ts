import { AcuityConstants } from 'fizz-kidz'

import { AcuityWebhookData } from '../../acuity'
import { AcuityClient } from '../../acuity/core/acuity-client'
import { ZohoClient } from '../../zoho/zoho-client'

/**
 * In Zoho Campaigns, there is an automation to send an email on the evening of their program asking how it was.
 * However we only want to send this if they actually attended that day.
 *
 * This function will check if they have checked in, and if so, update Zoho.
 * This can then be used as a condition in the automation.
 *
 * Since Zoho only stores the date of the first program they booked, only mark the customer as attended
 * if the date of this program is the same as the one in Zoho.
 *
 */
export async function checkInToCrm(data: AcuityWebhookData) {
    const acuity = await AcuityClient.getInstance()
    const appointment = await acuity.getAppointment(data.id)
    const dateTime = appointment.datetime.split('T')[0]
    const isCheckedIn = appointment.labels?.some((it) => it.id === AcuityConstants.Labels.CHECKED_IN) || false

    if (isCheckedIn) {
        const zoho = new ZohoClient()
        await zoho.holidayProgramCheckin({ email: appointment.email, programDate: dateTime })
    }
}
