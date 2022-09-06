import { Emails } from './types'
import fs from 'fs'
import path from 'path'
import mjml2html from 'mjml'
import sgMail, { MailDataRequired } from '@sendgrid/mail'

var Mustache = require('mustache')

sgMail.setApiKey(process.env.SEND_GRID_API_KEY)

export class MailClient {
    async sendEmail<T extends keyof Emails>(email: T, emailInfo: Emails[T]) {
        console.log('generating html...')
        let html = this._generateHtml(emailInfo)
        console.log('generated successfully!')
        console.log("sending email...")
        await this._sendEmail(email, emailInfo.emailAddress, html)
        console.log('email sent successfully!')
    }

    private async _sendEmail<T extends keyof Emails>(email: T, emailAddress: string, html: string) {
        switch (email) {
            case 'holidayProgramConfirmation':
                await this._sendHolidayProgramConfirmationEmail(emailAddress, html)
                return
            case 'termContinuationEmail':
                await this._sendTermContinuationEmail(emailAddress, html)
                return
        }
    }

    private _generateHtml<T extends keyof Emails>(emailInfo: Emails[T]): string {
        const filename = emailInfo.templateName
        let mjml = fs.readFileSync(path.resolve(__dirname, `./mjml/${filename}`), 'utf8')
        var output = Mustache.render(mjml, emailInfo.values)
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

    private async _sendHolidayProgramConfirmationEmail(email: string, html: string) {
        const msg: MailDataRequired = {
            to: email,
            from: {
                name: 'Fizz Kidz',
                email: 'bookings@fizzkidz.com.au',
            }, // Use the email address or domain you verified above
            subject: 'Holiday program booking confirmation',
            html: html,
        }
        await sgMail.send(msg)
    }

    private async _sendTermContinuationEmail(email: string, html: string) {
        const msg: MailDataRequired = {
            to: email,
            from: {
                name: "Fizz Kidz",
                email: "bookings@fizzkidz.com.au"
            },
            subject: "Thanks for coming to your first session!",
            html: html
        }
        await sgMail.send(msg)
    }
}
