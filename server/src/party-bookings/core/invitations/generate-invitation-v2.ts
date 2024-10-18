import fs from 'fs'
import path from 'path'

import {
    InvitationOption,
    InvitationsV2,
    WithoutId,
    WithoutUid,
    generateRandomString,
    getApplicationDomain,
    getLocationAddress,
} from 'fizz-kidz'
import fsPromise from 'fs/promises'
import { DateTime } from 'luxon'
import Mustache from 'mustache'
import puppeteer, { Browser } from 'puppeteer'
import QRCode from 'qrcode'

import chromium from '@sparticuz/chromium'

import { StorageClient } from '../../../firebase/StorageClient'
import { env, projectId } from '../../../init'
import { MixpanelClient } from '../../../mixpanel/mixpanel-client'

/**
 * Creates and uploads an invitation to storage, but does not create a document in firestore.
 *
 * Many invitations can be created, but a booking can only have one invitation linked to it.
 * Linking an invitation happens after the invitation has been created, and the parent confirms to finalize.
 *
 * @param input
 * @returns
 */
export async function generateInvitationV2(input: WithoutId<WithoutUid<InvitationsV2.Invitation>>) {
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
            acceptInsecureCerts: true,
        })
    }
    const [page] = await browser.pages()

    const id = generateRandomString()

    const qrCode = await QRCode.toDataURL(`${getApplicationDomain(env)}/invitation/v2/${id}`)

    const htmlFile = FileMap[input.invitation]
    const html = await fsPromise.readFile(path.resolve(__dirname, `./party-bookings/invitations/${htmlFile}`), 'utf8')
    const output = Mustache.render(html, {
        ...input,
        qrCode,
        date: DateTime.fromJSDate(input.date, { zone: 'Australia/Melbourne' }).toFormat('dd/LL/yyyy'),
        rsvpDate: DateTime.fromJSDate(input.rsvpDate, { zone: 'Australia/Melbourne' }).toFormat('dd/LL/yyyy'),
        address: input.$type === 'studio' ? getLocationAddress(input.studio) : input.address,
    })

    if (!process.env.FUNCTIONS_EMULATOR) {
        page.setViewport({
            height: 1096,
            width: 793,
        })
    }
    await page.setContent(output)
    const filename = 'invitation.png'

    const destination = `invitations-v2/${id}/${filename}`

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

    // delete the file, and if the temp directory is empty afterwards, delete it
    await fsPromise.rm(`${__dirname}/temp/${filename}`)
    const files = await fsPromise.readdir(`${__dirname}/temp`)
    if (files.length === 0) {
        await fsPromise.rmdir(`${__dirname}/temp`, { recursive: true })
    }

    const mixpanel = await MixpanelClient.getInstance()
    await mixpanel.track('invitation-generated-v2', {
        invitationId: id,
        partyDate: input.date,
        invitation: input.invitation,
        bookingId: input.bookingId,
        parentName: input.parentName,
    })

    return { invitationId: id }
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
}
