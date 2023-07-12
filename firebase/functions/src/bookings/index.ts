import { google } from 'googleapis'
import googleCredentials from '../../credentials/google-credentials.json'

export function runAppsScript(functionName: string, parameters: any[]) {
    const scriptId = '1nvPPH76NCCZfMYNWObohW4FmW-NjLWgtHk-WdBYh2McYSXnJlV5HTf42'
    const script = google.script('v1')

    const oAuth2Client = new google.auth.OAuth2(
        googleCredentials.web.client_id,
        googleCredentials.web.client_secret,
        googleCredentials.web.redirect_uris[0]
    )

    oAuth2Client.setCredentials({
        refresh_token: googleCredentials.refresh_token,
    })

    // Tell apps-script which environment we are using, in order to use correct calendar ID's
    // This is shit... and ideally there would be a prod/dev environment for apps script, but this is hard.
    // More ideally, we would not use apps script at all, and instead call the Gmail/Calendar/Forms APIs directly from here.
    const environment = JSON.parse(process.env.FIREBASE_CONFIG).projectId === 'bookings-prod' ? 'prod' : 'dev'
    parameters.push(environment)

    return new Promise<string>((resolve, reject) => {
        script.scripts.run(
            {
                auth: oAuth2Client,
                requestBody: {
                    function: functionName,
                    parameters: parameters,
                    devMode: true,
                },
                scriptId: scriptId,
            },
            (err, resp) => {
                if (err) {
                    // The API encountered a problem before the script started executing
                    console.log('The API returned an error: ' + err)
                    reject(err)
                }
                if (resp?.data.error) {
                    // The API executed, but the script returned an error.

                    // Extract the first (and only) set of error details. The values of this
                    // object are the script's 'errorMessage' and 'errorType', and an array
                    // of stack trace elements.
                    const error = resp.data.error.details?.[0]
                    console.log('Script error message: ' + error?.errorMessage)
                    console.log('Script error stacktrace:')

                    if (error?.scriptStackTraceElements) {
                        // There may not be a stacktrace if the script didn't start executing.
                        for (const trace of error.scriptStackTraceElements) {
                            console.log('\t%s: %s', trace.function, trace.lineNumber)
                        }
                    }
                    reject(resp.data.error)
                } else {
                    resolve(JSON.stringify(resp?.data))
                }
            }
        )
    })
}

export * from './functions/createPartyBooking'
export * from './functions/updatePartyBooking'
export * from './functions/deletePartyBooking'
export * from './functions/sendPartyForms'
