import { Invitation } from 'fizz-kidz'
import { onCall } from '../../../utilities'
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { projectName, storage } from '../../../init'
import crypto from 'crypto'
import * as functions from 'firebase-functions'
const Mustache = require('mustache')

export const downloadInvitation = onCall<'downloadInvitation'>(async (input, _context) => {
    // console.log(req.body)
    const { invitation, ...values } = input

    try {
        switch (invitation) {
            case Invitation.Freckles:
                console.log('running')
                const browser = await puppeteer.launch()
                const [page] = await browser.pages()

                const html = fs.readFileSync(path.resolve(__dirname, '../../../sendgrid/html/invite.html'), 'utf8')
                var output = Mustache.render(html, values)

                await page.setContent(output)
                const filename = `${values.childName}-invitation.pdf`
                const destination = `invitations/${crypto.randomBytes(16).toString('hex')}/${filename}`

                fs.mkdirSync(`${__dirname}/temp`)
                console.log('making pdf...')
                await page.pdf({
                    path: `${__dirname}/temp/${filename}`,
                    format: 'A4',
                    pageRanges: '1',
                })

                await storage.bucket(`${projectName}.appspot.com`).upload(`${__dirname}/temp/${filename}`, {
                    destination,
                })
                console.log('done')
                console.log('removing folder')
                fs.rmdirSync(`${__dirname}/temp`, { recursive: true })
                console.log('folder removed')
                return destination
        }
    } catch (e) {
        throw new functions.https.HttpsError('internal', 'failed creating invitation', e)
    }
    return ''
    // resp.status(200).send(destination)
})
