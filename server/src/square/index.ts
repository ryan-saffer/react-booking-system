import { onRequest } from 'firebase-functions/v2/https'

export const squareWebhook = onRequest((req, res) => {
    console.log(req.body)
    res.status(200).send()
})
