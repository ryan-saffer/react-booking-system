import crypto from 'crypto'
import path from 'path'

import { GenerateInvitation } from 'fizz-kidz'
import fs from 'fs/promises'
import Mustache from 'mustache'
import puppeteer from 'puppeteer'

import chromium from '@sparticuz/chromium'

import { StorageClient } from '../../firebase/StorageClient'
import { projectId } from '../../init'

type Invitation = 'freckles' | 'sparkles'

export async function generateInvitation(input: GenerateInvitation) {
    const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: true,
        ignoreHTTPSErrors: true,
    })
    const [page] = await browser.pages()

    const htmlFile = getFilename('freckles')
    const html = await fs.readFile(path.resolve(__dirname, `./party-bookings/invitations/${htmlFile}`), 'utf8')
    const output = Mustache.render(html, input)

    await page.setContent(output)
    page.setViewport({
        height: 1096,
        width: 793,
    })
    const filename = 'invitation.png'
    const id = crypto.randomBytes(16).toString('hex')
    const destination = `invitations/${id}/${filename}`

    await fs.mkdir(`${__dirname}/temp`)
    await page.screenshot({
        path: `${__dirname}/temp/${filename}`,
        fullPage: true,
    })

    const storage = await StorageClient.getInstance()
    await storage.bucket(`${projectId}.appspot.com`).upload(`${__dirname}/temp/${filename}`, {
        destination,
    })
    await fs.rmdir(`${__dirname}/temp`, { recursive: true })

    console.log('destination:', destination)
    return id
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
