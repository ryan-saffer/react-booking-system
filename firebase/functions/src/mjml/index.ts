import * as functions from 'firebase-functions'
import mjml2html from 'mjml'

type Mjml = {
    mjml: string
}

export const mjml = functions
    .region('australia-southeast1')
    .https.onRequest((req, resp) => {

        console.log("Starting mjml request")

        const rawMjml = req.body as Mjml

        console.log('parsed json successfully')

        const htmlOutput = mjml2html(rawMjml.mjml)

        if (htmlOutput.errors.length > 1) {
            resp.status(500).send(htmlOutput.errors)
            return
        } else {
            console.log("Converted successfully")
            resp.status(200).send(htmlOutput.html)
            return
        }
    })