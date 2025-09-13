import type { sheets_v4 } from 'googleapis'

import { getOAuth2Client } from './google-oauth'
import type { ClientStatus } from '../utilities/types'

const SHEETS = {
    anaphylacticChildrenChecklist: '1-LYEEUh4jaXQhs9QgBLazzKG0VcAIYKhDvE6qkeDcWU',
    afterSchoolProgramWaitlist: '1X2Y1TVkShfazGS6t2v-jbfJwQQCNXIApvE3G2kfJk-A',
    holidayProgramAdditionalNeeds: '1doQKQJylAfGTQC5WnxMN-Ixib5T2JTka65rVhl6fP6E',
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
        const OAuth2Client = await getOAuth2Client()
        this.#sheetsClient = google.sheets({ version: 'v4', auth: OAuth2Client })
        this.#status = 'initialised'
    }

    get #sheets() {
        if (this.#sheetsClient) return this.#sheetsClient
        throw new Error('Sheets client not initialised')
    }

    addRowToSheet(sheet: keyof typeof SHEETS, values: string[][], sheetName: string = '') {
        const range = sheetName ? `${sheetName}!A1` : 'A1'
        return this.#sheets.spreadsheets.values.append(
            {
                spreadsheetId: SHEETS[sheet],
                range,
                insertDataOption: 'INSERT_ROWS',
                valueInputOption: 'RAW',
                requestBody: { values },
            },
            undefined
        )
    }
}
