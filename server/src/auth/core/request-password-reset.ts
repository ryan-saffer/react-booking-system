import { MailClient } from '@/sendgrid/MailClient'

import { getPasswordResetLink } from './get-password-reset-link'

export async function requestPasswordReset(email: string) {
    const normalisedEmail = email.trim().toLowerCase()

    try {
        const resetLink = await getPasswordResetLink(normalisedEmail)
        const mailClient = await MailClient.getInstance()

        await mailClient.sendEmail('passwordReset', normalisedEmail, { resetLink }, { bccBookings: false })
    } catch (err: any) {
        if (err.code === 'auth/user-not-found') {
            return
        }

        throw err
    }
}
