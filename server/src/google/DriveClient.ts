import fs from 'fs'
import os from 'os'
import path from 'path'
import { Readable } from 'stream'

import type { drive_v3 } from 'googleapis'
import { finished } from 'stream/promises'
import type { ReadableStream } from 'stream/web'

import googleCredentials from '../../credentials/google-credentials.json'
import type { ClientStatus } from '../utilities/types'

export class DriveClient {
    private static instance: DriveClient
    #status: ClientStatus = 'not-initialised'

    #driveClient: drive_v3.Drive | null = null

    private constructor() {}

    static async getInstance(): Promise<DriveClient> {
        if (!DriveClient.instance) {
            DriveClient.instance = new DriveClient()
            await DriveClient.instance.#initialise()
        }
        while (DriveClient.instance.#status === 'initialising') {
            await new Promise((resolve) => setTimeout(resolve, 20))
        }
        return DriveClient.instance
    }

    get #drive() {
        if (this.#driveClient) return this.#driveClient
        throw new Error('Drive client not initialised')
    }

    async #initialise() {
        this.#status = 'initialising'
        const { google } = await import('googleapis')
        const OAuth2Client = new google.auth.OAuth2(
            googleCredentials.web.client_id,
            googleCredentials.web.client_secret,
            googleCredentials.web.redirect_uris[0]
        )

        OAuth2Client.setCredentials({
            refresh_token: googleCredentials.refresh_token,
        })

        this.#driveClient = google.drive({ version: 'v3', auth: OAuth2Client })
        this.#status = 'initialised'
    }

    async uploadFileFromUrl(url: string, filename: string, mimeType: string, folderId: string) {
        // download
        const tempFilePath = path.join(os.tmpdir(), filename)
        const tfnFileStream = fs.createWriteStream(tempFilePath)

        const tfnFileResult = await fetch(url)
        await finished(Readable.fromWeb(tfnFileResult.body as ReadableStream<any>).pipe(tfnFileStream))

        // upload
        await this.#drive.files.create({
            requestBody: {
                name: filename,
                parents: [folderId],
            },
            media: {
                mimeType,
                body: fs.createReadStream(tempFilePath),
            },
        })
    }

    async createFolder(folderName: string, parent: string) {
        const {
            data: { id: folderId },
        } = await this.#drive.files.create({
            requestBody: {
                name: folderName,
                parents: [parent],
                mimeType: 'application/vnd.google-apps.folder',
            },
        })

        return folderId
    }
}
