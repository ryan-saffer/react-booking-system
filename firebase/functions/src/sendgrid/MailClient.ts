import { Emails } from './types'
import fs from 'fs'
import path from 'path'
import mjml2html from 'mjml'
import sgMail from '@sendgrid/mail'
import { MailData } from '@sendgrid/helpers/classes/mail'

var Mustache = require('mustache')

sgMail.setApiKey(process.env.SEND_GRID_API_KEY)

export class MailClient {
    async sendEmail<T extends keyof Emails>(email: T, to: string, values: Emails[T]) {
        console.log('generating html...')
        const { emailInfo, template } = this._getInfo(email, to)
        let html = this._generateHtml(template, values)
        console.log('generated successfully!')
        console.log('sending email...')
        await sgMail.send({ ...emailInfo, html })
        console.log('email sent successfully!')
    }

    private _generateHtml(template: string, values: object): string {
        let mjml = fs.readFileSync(path.resolve(__dirname, `./mjml/${template}`), 'utf8')
        var output = Mustache.render(mjml, values)
        let mjmlOutput = mjml2html(output)
        if (mjmlOutput.errors.length > 0) {
            mjmlOutput.errors.forEach((error) => {
                console.error(error.formattedMessage)
            })
            throw new Error('error converting mjml to html')
        } else {
            return mjmlOutput.html
        }
    }

    private _getInfo<T extends keyof Emails>(email: T, to: string): { emailInfo: MailData; template: string } {
        switch (email) {
            case 'holidayProgramConfirmation':
                return {
                    emailInfo: {
                        to,
                        from: {
                            name: 'Fizz Kidz',
                            email: 'bookings@fizzkidz.com.au',
                        },
                        subject: 'Holiday program booking confirmation',
                    },
                    template: 'holiday_program_confirmation.html',
                }
            case 'scienceTermEnrolmentConfirmation':
                return {
                    emailInfo: {
                        to,
                        from: {
                            name: 'Fizz Kidz',
                            email: 'bookings@fizzkidz.com.au',
                        },
                        subject: 'Science Program Booking Confirmation',
                    },
                    template: 'science_term_enrolment_confirmation.html',
                }
            case 'termContinuationEmail':
                return {
                    emailInfo: {
                        to,
                        from: {
                            name: 'Fizz Kidz',
                            email: 'bookings@fizzkidz.com.au',
                        },
                        subject: 'Thanks for coming to your first session!',
                    },
                    template: 'term_continuation_email.html',
                }
            case 'scienceTermUnenrolmentConfirmation':
                return {
                    emailInfo: {
                        to,
                        from: {
                            name: 'Fizz Kidz',
                            email: 'bookings@fizzkidz.com.au',
                        },
                        subject: 'Unenrolment Confirmation',
                    },
                    template: 'term_unenrolment_confirmation.html',
                }
            default:
                throw new Error(`Unrecognised email template: ${email}`)
        }
    }
}
