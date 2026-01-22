import fs from 'fs'
import os from 'os'
import path from 'path'
import { Readable } from 'stream'
import { finished } from 'stream/promises'

import { getOAuth2Client } from './google-oauth'

import type { ClientStatus } from '../utilities/types'
import type { drive_v3 } from 'googleapis'
import type { ReadableStream } from 'stream/web'


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
        const OAuth2Client = await getOAuth2Client()
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
            supportsAllDrives: true,
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
            supportsAllDrives: true,
            requestBody: {
                name: folderName,
                parents: [parent],
                mimeType: 'application/vnd.google-apps.folder',
            },
        })

        return folderId
    }
}
