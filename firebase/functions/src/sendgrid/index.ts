import * as functions from 'firebase-functions'
import { MailClient } from './EmailClient'
import { Emails } from './types'

export const sendEmail = functions.https.onRequest(async (req, res) => {
    const emailInfo: Emails['holidayProgramConfirmation'] = {
        templateName: 'holiday_program_confirmation.html',
        parentEmail: 'ryansaffer@gmail.com',
        values: {
            parentName: 'Ryan',
            location: 'Fizz Kidz Balwyn',
            address: '180 Whitehorse Rd, Balwyn 3805',
            bookings: [
                {
                    datetime: 'Jimmy - 10am, Mon 1st March 2022',
                    confirmationPage:
                        'https://app.acuityscheduling.com/schedule.php?owner=17957624&action=appt&id%5B%5D=09c3f03621a300980fb787304608c56e',
                },
                {
                    datetime: 'Ryan - 10am, Mon 1 March 2022',
                    confirmationPage:
                        'https://app.acuityscheduling.com/schedule.php?owner=17957624&action=appt&id%5B%5D=09c3f03621a300980fb787304608c56e',
                },
            ],
        },
    }

    const mailClient = new MailClient()

    try {
        await mailClient.sendEmail('holidayProgramConfirmation', emailInfo)
        res.send(200)
    } catch (err) {
        res.status(500).send(err)
    }
})
