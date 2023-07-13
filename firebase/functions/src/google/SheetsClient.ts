import googleCredentials from '../../credentials/google-credentials.json'
import { sheets_v4, google } from 'googleapis'

const SHEETS = {
    anaphylacticChildrenChecklist: '1-LYEEUh4jaXQhs9QgBLazzKG0VcAIYKhDvE6qkeDcWU',
}

class SheetsClient {
    private _sheets: sheets_v4.Sheets

    constructor() {
        const OAuth2Client = new google.auth.OAuth2(
            googleCredentials.web.client_id,
            googleCredentials.web.client_secret,
            googleCredentials.web.redirect_uris[0]
        )

        OAuth2Client.setCredentials({
            refresh_token: googleCredentials.refresh_token,
        })

        this._sheets = google.sheets({ version: 'v4', auth: OAuth2Client })
    }

    addRowToSheet(sheet: keyof typeof SHEETS, values: string[][]) {
        return this._sheets.spreadsheets.values.append(
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
export function getSheetsClient() {
    if (sheetsClient) return sheetsClient
    sheetsClient = new SheetsClient()
    return sheetsClient
}
