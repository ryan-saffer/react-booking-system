import fs from 'fs'
import path from 'path'

import { InvitationsV2, WithoutId, WithoutUid, generateRandomString } from 'fizz-kidz'
import fsPromise from 'fs/promises'
import { DateTime } from 'luxon'

import { StorageClient } from '../../../firebase/StorageClient'
import { projectId } from '../../../init'
import { MixpanelClient } from '../../../mixpanel/mixpanel-client'
import { createCanvas, loadImage, PNGStream, registerFont } from 'canvas'

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

    registerFont(path.resolve(__dirname, './party-bookings/invitations/fonts/lilita-one.ttf'), { family: 'lilita' })
    const image = await loadImage(path.resolve(__dirname, './party-bookings/invitations/invitation-test.png'))

    const canvas = createCanvas(image.width, image.height)
    const ctx = canvas.getContext('2d')

    ctx.drawImage(image, 0, 0, image.width, image.height)

    // let browser: Browser
    // if (process.env.FUNCTIONS_EMULATOR) {
    //     browser = await puppeteer.launch()
    // } else {
    //     browser = await puppeteer.launch({
    //         args: chromium.args,
    //         defaultViewport: chromium.defaultViewport,
    //         executablePath: await chromium.executablePath(),
    //         headless: true,
    //         acceptInsecureCerts: true,
    //     })
    // }
    // const [page] = await browser.pages()

    const id = generateRandomString()

    // const qrCode = await QRCode.toDataURL(`${getApplicationDomain(env)}/invitation/v2/${id}`)

    // const htmlFile = FileMap[input.invitation]
    // const html = await fsPromise.readFile(path.resolve(__dirname, `./party-bookings/invitations/${htmlFile}`), 'utf8')
    // const output = Mustache.render(html, {
    //     ...input,
    //     qrCode,
    //     date: DateTime.fromJSDate(input.date, { zone: 'Australia/Melbourne' }).toFormat('dd/LL/yyyy'),
    //     rsvpDate: DateTime.fromJSDate(input.rsvpDate, { zone: 'Australia/Melbourne' }).toFormat('dd/LL/yyyy'),
    //     address: input.$type === 'studio' ? getLocationAddress(input.studio) : input.address,
    // })

    // if (!process.env.FUNCTIONS_EMULATOR) {
    //     page.setViewport({
    //         height: 1096,
    //         width: 793,
    //     })
    // }
    // await page.setContent(output)
    const filename = 'invitation.png'

    const destination = `invitations-v2/${id}/${filename}`

    if (!fs.existsSync(`${__dirname}/temp`)) {
        await fsPromise.mkdir(`${__dirname}/temp`)
    }
    // await page.screenshot({
    //     path: `${__dirname}/temp/${filename}`,
    //     fullPage: true,
    // })

    // Set font properties for the text
    ctx.font = '120px lilita'
    // ctx.strokeStyle = '#4DC5D9'
    // ctx.lineWidth = 4
    ctx.textAlign = 'center'
    // ctx.strokeText("RYAN'S 5TH", 740, 1060)
    ctx.fillStyle = '#ABC954'

    // Draw the text at a specific position (e.g., center of the image)
    ctx.fillText(`${input.childName}'s ${input.childAge}th`, 740, 1060)

    ctx.font = 'bold 40px Trebuchet MS'
    ctx.fillStyle = 'black'
    ctx.textAlign = 'left'
    ctx.fillText(DateTime.fromJSDate(input.date, { zone: 'Australia/Melbourne' }).toFormat('dd/LL/yyyy'), 482, 1345)

    const stream = canvas.createPNGStream()
    const out = fs.createWriteStream(`${__dirname}/temp/${filename}`)

    await asyncStream(stream, out)

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

// const FileMap: Record<InvitationOption, string> = {
//     Freckles: 'freckles.html',
//     Stripes: 'stripes.html',
//     Dots: 'dots.html',
//     'Glitz & Glam': 'glitz.html',
//     'Bubbling Fun': 'bubbling.html',
//     'Bubbling Blue Fun': 'bubbling-blue.html',
//     'Slime Time': 'slime.html',
//     'Tie Dye': 'tye-dye.html',
//     Swiftie: 'swift.html',
// }

function asyncStream(stream: PNGStream, out: fs.WriteStream) {
    return new Promise<void>((resolve, reject) => {
        stream.pipe(out)
        out.on('finish', () => {
            resolve()
        })
        out.on('error', () => reject('error writing canvas to png'))
    })
}
