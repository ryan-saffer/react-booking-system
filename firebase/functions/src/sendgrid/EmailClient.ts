import { EmailInfo, Emails } from './types'
import fs from 'fs'
import path from 'path'
import mjml2html from 'mjml'
import sgMail from '@sendgrid/mail'

var Mustache = require('mustache')

sgMail.setApiKey(process.env.SEND_GRID_API_KEY)

export class MailClient {
    async sendEmail<T extends keyof Emails>(emailInfo: EmailInfo, values: Emails[T]) {
        console.log('generating html...')
        let html = this._generateHtml(values)
        console.log('generated successfully!')
        console.log('sending email...')
        await sgMail.send({ ...emailInfo, html })
        console.log('email sent successfully!')
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
}
