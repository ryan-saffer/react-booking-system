import { drive_v3, google } from 'googleapis'
import googleCredentials from '../../credentials/google-credentials.json'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { Readable } from 'stream'
import { finished } from 'stream/promises'
import { ReadableStream } from 'stream/web'

class DriveClient {
    private drive: drive_v3.Drive

    constructor() {
        const OAuth2Client = new google.auth.OAuth2(
            googleCredentials.web.client_id,
            googleCredentials.web.client_secret,
            googleCredentials.web.redirect_uris[0]
        )

        OAuth2Client.setCredentials({
            refresh_token: googleCredentials.refresh_token,
        })

        this.drive = google.drive({ version: 'v3', auth: OAuth2Client })
    }

    async uploadFileFromUrl(url: string, filename: string, mimeType: string, folderId: string) {
        // download
        const tempFilePath = path.join(os.tmpdir(), filename)
        const tfnFileStream = fs.createWriteStream(tempFilePath)

        const tfnFileResult = await fetch(url)
        await finished(Readable.fromWeb(tfnFileResult.body as ReadableStream<any>).pipe(tfnFileStream))

        // upload
        await this.drive.files.create({
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
        } = await this.drive.files.create({
            requestBody: {
                name: folderName,
                parents: [parent],
                mimeType: 'application/vnd.google-apps.folder',
            },
        })

        return folderId
    }
}

let driveClient: DriveClient

export function getDriveClient() {
    if (driveClient) return driveClient
    driveClient = new DriveClient()
    return driveClient
}
