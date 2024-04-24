import { UpdateAfterSchoolEnrolmentParams } from 'fizz-kidz'

import { DatabaseClient } from '../../firebase/DatabaseClient'
import { MailClient } from '../../sendgrid/MailClient'

export async function updateAfterSchoolEnrolment(input: UpdateAfterSchoolEnrolmentParams) {
    const { id, ...updatedEnrolment } = input

    if (updatedEnrolment.continuingWithTerm === 'no') {
        // if choosing not to continue with term, send an email notification.
        // first make sure the value is actually changing
        const existingEnrolment = await DatabaseClient.getAfterSchoolEnrolment(id)
        if (existingEnrolment.continuingWithTerm !== 'no') {
            const mailClient = await MailClient.getInstance()
            await mailClient.sendEmail('notContinuingNotification', 'bonnie.c@fizzkidz.com.au', {
                parentName: `${existingEnrolment.parent.firstName} ${existingEnrolment.parent.lastName}`,
                parentEmail: existingEnrolment.parent.email,
                parentMobile: existingEnrolment.parent.phone,
                childName: existingEnrolment.child.firstName,
                program: existingEnrolment.className,
            })
        }
    }

    await DatabaseClient.updateAfterSchoolEnrolment(id, updatedEnrolment)
    const enrolment = await DatabaseClient.getAfterSchoolEnrolment(id)

    return enrolment
}
