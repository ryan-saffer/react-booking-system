import fs from 'fs'
import path from 'path'

import { GenerateInvitation } from 'fizz-kidz'
import fsPromise from 'fs/promises'
import { DateTime } from 'luxon'
import Mustache from 'mustache'
import puppeteer, { Browser } from 'puppeteer'

import chromium from '@sparticuz/chromium'

import { DatabaseClient } from '../../firebase/DatabaseClient'
import { FirestoreRefs } from '../../firebase/FirestoreRefs'
import { StorageClient } from '../../firebase/StorageClient'
import { projectId } from '../../init'

type Invitation = 'freckles' | 'sparkles'

export async function generateInvitation(input: GenerateInvitation) {
    // serialise back into a date
    input.date = new Date(input.date)
    input.rsvpDate = new Date(input.rsvpDate)

    let browser: Browser
    if (process.env.FUNCTIONS_EMULATOR) {
        browser = await puppeteer.launch()
    } else {
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: true,
            ignoreHTTPSErrors: true,
        })
    }
    const [page] = await browser.pages()

    const htmlFile = getFilename('freckles')
    const html = await fsPromise.readFile(path.resolve(__dirname, `./party-bookings/invitations/${htmlFile}`), 'utf8')
    const output = Mustache.render(html, {
        ...input,
        date: DateTime.fromJSDate(input.date).toLocaleString(DateTime.DATE_SHORT),
        rsvpDate: DateTime.fromJSDate(input.rsvpDate).toLocaleString(DateTime.DATE_SHORT),
        address: '141 Waverly Rd, Malvern 3145',
    })

    await page.setContent(output)
    if (!process.env.FUNCTIONS_EMULATOR) {
        page.setViewport({
            height: 1096,
            width: 793,
        })
    }
    const filename = 'invitation.png'

    const newDocRef = (await FirestoreRefs.invitations()).doc()
    const newDocId = newDocRef.id

    const destination = `invitations/${newDocId}/${filename}`

    if (!fs.existsSync(`${__dirname}/temp`)) {
        await fsPromise.mkdir(`${__dirname}/temp`)
    }
    await page.screenshot({
        path: `${__dirname}/temp/${filename}`,
        fullPage: true,
    })

    const storage = await StorageClient.getInstance()
    await storage.bucket(`${projectId}.appspot.com`).upload(`${__dirname}/temp/${filename}`, {
        destination,
    })
    await DatabaseClient.createInvitation(newDocRef, input.date)
    await fsPromise.rmdir(`${__dirname}/temp`, { recursive: true })

    return newDocId
}

function getFilename(invitation: Invitation) {
    switch (invitation) {
        case 'freckles':
            return 'freckles.html'

        case 'sparkles':
            return 'sparkles.html'

        default: {
            const exhaustiveCheck: never = invitation
            throw new Error(`unregonised invitation name: '${exhaustiveCheck}'`)
        }
    }
}