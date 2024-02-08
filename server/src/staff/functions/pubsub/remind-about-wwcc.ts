import { onSchedule } from 'firebase-functions/v2/scheduler'
import { FirestoreRefs } from '../../../firebase/FirestoreRefs'
import { MailClient } from '../../../sendgrid/MailClient'

export const remindAboutWwcc = onSchedule(
    {
        timeZone: 'Australia/Melbourne',
        schedule: '1, 14, 28 of month 08:30',
    },
    async () => {
        const employeesRef = await FirestoreRefs.employees()
        const snap = await employeesRef
            .where('wwcc.status', '==', 'I have applied for a WWCC and have an application number')
            .get()

        const employees = snap.docs.map((doc) => {
            const employee = doc.data()
            return `${employee.firstName} ${employee.lastName}`
        })

        if (employees.length > 0) {
            const mailClient = await MailClient.getInstance()
            await mailClient.sendEmail('wwccReminder', 'people@fizzkidz.com.au', {
                employees,
            })
        }
    }
)
