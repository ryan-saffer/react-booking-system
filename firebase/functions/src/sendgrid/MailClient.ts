import { Emails } from './types'
import fs from 'fs'
import path from 'path'
import mjml2html from 'mjml'
import sgMail from '@sendgrid/mail'
import { MailData } from '@sendgrid/helpers/classes/mail'
import { env } from '../init'

import Mustache from 'mustache'

sgMail.setApiKey(process.env.SEND_GRID_API_KEY)

class MailClient {
    async sendEmail<T extends keyof Emails>(email: T, to: string, values: Emails[T], subject?: string) {
        console.log('generating html...')
        const { emailInfo, template, useMjml } = this._getInfo(email, to, subject)
        try {
            const html = this._generateHtml(template, values, useMjml)
            console.log('generated successfully!')
            console.log('sending email...')
            if (env === 'prod') {
                await sgMail.send({ ...emailInfo, bcc: 'bookings@fizzkidz.com.au', html })
            } else {
                await sgMail.send({ ...emailInfo, html })
            }
            console.log('email sent successfully!')
        } catch (error) {
            throw new Error(`unable to send email '${email}' to '${to}'`)
        }
    }

    private _generateHtml(template: string, values: Record<string, unknown>, useMjml: boolean): string {
        const mjml = fs.readFileSync(path.resolve(__dirname, `./mjml/${template}`), 'utf8')
        const output = Mustache.render(mjml, values)
        if (useMjml) {
            const mjmlOutput = mjml2html(output)
            if (mjmlOutput.errors.length > 0) {
                mjmlOutput.errors.forEach((error) => {
                    console.log(error.formattedMessage)
                })
                console.log('error converting mjml to html')
                throw new Error('error converting mjml to html')
            } else {
                return mjmlOutput.html
            }
        } else {
            return output
        }
    }

    private _getInfo<T extends keyof Emails>(
        email: T,
        to: string,
        subject?: string
    ): { emailInfo: MailData; template: string; useMjml: boolean } {
        switch (email) {
            case 'holidayProgramConfirmation':
                return {
                    emailInfo: {
                        to,
                        from: {
                            name: 'Fizz Kidz',
                            email: 'bookings@fizzkidz.com.au',
                        },
                        subject: subject || 'Holiday program booking confirmation',
                    },
                    template: 'holiday_program_confirmation.html',
                    useMjml: true,
                }
            case 'scienceTermEnrolmentConfirmation':
                return {
                    emailInfo: {
                        to,
                        from: {
                            name: 'Fizz Kidz',
                            email: 'bookings@fizzkidz.com.au',
                        },
                        subject: subject || 'Science Program Enrolment Confirmation',
                    },
                    template: 'science_term_enrolment_confirmation.html',
                    useMjml: true,
                }
            case 'termContinuationEmail':
                return {
                    emailInfo: {
                        to,
                        from: {
                            name: 'Fizz Kidz',
                            email: 'bookings@fizzkidz.com.au',
                        },
                        subject: subject || 'Thanks for coming to your first session!',
                    },
                    template: 'term_continuation_email.html',
                    useMjml: true,
                }
            case 'scienceTermUnenrolmentConfirmation':
                return {
                    emailInfo: {
                        to,
                        from: {
                            name: 'Fizz Kidz',
                            email: 'bookings@fizzkidz.com.au',
                        },
                        subject: subject || 'Unenrolment Confirmation',
                    },
                    template: 'term_unenrolment_confirmation.html',
                    useMjml: true,
                }
            case 'scienceParentPortalLink':
                return {
                    emailInfo: {
                        to,
                        from: {
                            name: 'Fizz Kidz',
                            email: 'bookings@fizzkidz.com.au',
                        },
                        subject: subject || 'Manage your enrolment',
                    },
                    template: 'science_parent_portal.html',
                    useMjml: true,
                }
            case 'partyFormFilledInAgain':
                return {
                    emailInfo: {
                        to,
                        from: {
                            name: 'Fizz Kidz',
                            email: 'info@fizzkidz.com.au',
                        },
                        subject: subject || 'Party form filled in again!',
                    },
                    template: 'party_form_filled_in_again.html',
                    useMjml: false,
                }
            default:
                throw new Error(`Unrecognised email template: ${email}`)
        }
    }
}

const mailClient = new MailClient()
export { mailClient }
