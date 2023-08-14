import googleCredentials from '../../credentials/google-credentials.json'
import type { sheets_v4 } from 'googleapis'

const SHEETS = {
    anaphylacticChildrenChecklist: '1-LYEEUh4jaXQhs9QgBLazzKG0VcAIYKhDvE6qkeDcWU',
}

class SheetsClient {
    #sheetsClient: sheets_v4.Sheets | null = null

    get #sheets() {
        if (this.#sheetsClient) return this.#sheetsClient
        throw new Error('Sheets client not initialised')
    }

    async _initialise() {
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

let sheetsClient: SheetsClient
export async function getSheetsClient() {
    if (sheetsClient) return sheetsClient
    sheetsClient = new SheetsClient()
    await sheetsClient._initialise()
    return sheetsClient
}
