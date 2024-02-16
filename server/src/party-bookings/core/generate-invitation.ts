import crypto from 'crypto'
import path from 'path'

import fs from 'fs/promises'
import Mustache from 'mustache'
import puppeteer from 'puppeteer'

import { StorageClient } from '../../firebase/StorageClient'
import { projectId } from '../../init'
import { GenerateInvite } from '../functions/trpc/trpc.parties'

type Invitation = 'freckles' | 'sparkles'

export async function generateInvitation(input: GenerateInvite) {
    console.log(input)

    const browser = await puppeteer.launch()
    const [page] = await browser.pages()

    const htmlFile = getFilename('freckles')
    const html = await fs.readFile(path.resolve(__dirname, `./party-bookings/core/${htmlFile}`), 'utf8')
    const output = Mustache.render(html, input)

    await page.setContent(output)
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
