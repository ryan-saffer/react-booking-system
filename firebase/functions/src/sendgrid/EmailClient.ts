import { Emails } from './types'
import fs from 'fs'
import path from 'path'
import mjml2html from 'mjml'
import sgMail, { MailDataRequired } from '@sendgrid/mail'
import { EmailTemplates } from './constants'

var Mustache = require('mustache')

sgMail.setApiKey(process.env.SEND_GRID_API_KEY)

export class MailClient {
    async sendEmail<T extends keyof Emails>(email: T, emailInfo: Emails[T]) {
        console.log('generating html...')
        let html = this.generateHtml(email, emailInfo.values)
        console.log('generated successfully!')
        await this._sendEmail(email, emailInfo, html)
    }

    private async _sendEmail<T extends keyof Emails>(email: T, emailInfo: Emails[T], html: string) {
        switch (email) {
            case 'holidayProgramConfirmation':
                await this._sendHolidayProgramConfirmationEmail(emailInfo, html)
                return
        }
    }

    private generateHtml<T extends keyof Emails>(email: T, values: Emails[T]['values']): string {
        const filename = EmailTemplates[email]
        let mjml = fs.readFileSync(path.resolve(__dirname, `./mjml/${filename}`), 'utf8')
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

    private async _sendHolidayProgramConfirmationEmail(emailInfo: Emails['holidayProgramConfirmation'], html: string) {
        const msg: MailDataRequired = {
            to: emailInfo.parentEmail,
            from: {
                name: 'Fizz Kidz',
                email: 'bookings@fizzkidz.com.au',
            }, // Use the email address or domain you verified above
            subject: 'Holiday program booking confirmation',
            html: html,
        }
        console.log('sending email...')
        await sgMail.send(msg)
        console.log('email sent successfully!')
    }
}
