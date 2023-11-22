import googleCredentials from '../../credentials/google-credentials.json'
import type { sheets_v4 } from 'googleapis'
import { ClientStatus } from '../utilities/types'

const SHEETS = {
    anaphylacticChildrenChecklist: '1-LYEEUh4jaXQhs9QgBLazzKG0VcAIYKhDvE6qkeDcWU',
}

export class SheetsClient {
    private static instance: SheetsClient
    #status: ClientStatus = 'not-initialised'

    #sheetsClient: sheets_v4.Sheets | null = null

    private constructor() {}

    static async getInstance() {
        if (!SheetsClient.instance) {
            SheetsClient.instance = new SheetsClient()
            await SheetsClient.instance.#initialise()
        }
        while (SheetsClient.instance.#status === 'initialising') {
            await new Promise((resolve) => setTimeout(resolve, 20))
        }
        return SheetsClient.instance
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

        this.#sheetsClient = google.sheets({ version: 'v4', auth: OAuth2Client })
        this.#status = 'initialised'
    }

    get #sheets() {
        if (this.#sheetsClient) return this.#sheetsClient
        throw new Error('Sheets client not initialised')
    }

    addRowToSheet(sheet: keyof typeof SHEETS, values: string[][]) {
        return this.#sheets.spreadsheets.values.append(
            {
                spreadsheetId: SHEETS[sheet],
                range: 'A1',
                insertDataOption: 'INSERT_ROWS',
                valueInputOption: 'RAW',
                requestBody: { values },
            },
            undefined
        )
    }
}
