import fs from 'fs'
import path from 'path'

import type { GenerateInvitation, InvitationOption } from 'fizz-kidz'
import { addOrdinalSuffix, getStudioAddress } from 'fizz-kidz'
import fsPromise from 'fs/promises'
import { DateTime } from 'luxon'
import Mustache from 'mustache'
import type { Browser } from 'puppeteer'
import puppeteer from 'puppeteer'

import { DatabaseClient } from '@/firebase/DatabaseClient'
import { FirestoreRefs } from '@/firebase/FirestoreRefs'
import { StorageClient } from '@/firebase/StorageClient'
import { projectId } from '@/init'
import { MixpanelClient } from '@/mixpanel/mixpanel-client'
import chromium from '@sparticuz/chromium'

export async function generateInvitation(input: GenerateInvitation) {
    // serialise back into a date
    input.date = new Date(input.date)
    input.rsvpDate = new Date(input.rsvpDate)

    let browser: Browser | null = null

    try {
        if (process.env.FUNCTIONS_EMULATOR) {
            browser = await puppeteer.launch()
        } else {
            browser = await puppeteer.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: true,
                acceptInsecureCerts: true,
            })
        }
        const [page] = await browser.pages()

        const htmlFile = FileMap[input.invitation]
        const html = await fsPromise.readFile(
            path.resolve(__dirname, `./party-bookings/invitations/${htmlFile}`),
            'utf8'
        )
        const output = Mustache.render(html, {
            ...input,
            childAge: addOrdinalSuffix(input.childAge),
            date: DateTime.fromJSDate(input.date, { zone: 'Australia/Melbourne' }).toFormat('dd/LL/yyyy'),
            rsvpDate: DateTime.fromJSDate(input.rsvpDate, { zone: 'Australia/Melbourne' }).toFormat('dd/LL/yyyy'),
            address: input.$type === 'studio' ? getStudioAddress(input.studio) : input.address,
        })

        if (!process.env.FUNCTIONS_EMULATOR) {
            page.setViewport({
                height: 1096,
                width: 793,
            })
        }
        await page.setContent(output)
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

        const mixpanel = await MixpanelClient.getInstance()
        await mixpanel.track('invitation-generated', {
            invitationId: newDocId,
            partyDate: input.date,
            invitation: input.invitation,
        })

        return newDocId
    } finally {
        if (browser) {
            await browser.close()
        }
    }
}

const FileMap: Record<InvitationOption, string> = {
    Freckles: 'freckles.html',
    Stripes: 'stripes.html',
    Dots: 'dots.html',
    'Glitz & Glam': 'glitz.html',
    'Bubbling Fun': 'bubbling.html',
    'Bubbling Blue Fun': 'bubbling-blue.html',
    'Slime Time': 'slime.html',
    'Tie Dye': 'tye-dye.html',
    Swiftie: 'swift.html',
    'K-pop Demon Hunters': 'kpop.html',
}
