import { onRequest } from 'firebase-functions/v2/https'

import { HubspotClient } from '../../hubspot/HubspotClient'
import { logError } from '../../utilities'
import { ContactFormLocationMap, Form, PartyFormLocationMap } from '../contact-form-7-types'

export const contactForm7Webhook = onRequest(async (req, res) => {
    const formId = req.query.formId as keyof Form

    const hubspotClient = await HubspotClient.getInstance()

    switch (formId) {
        case 'party-booking': {
            const formData = req.body as Form['party-booking']
            const [firstName, lastName] = formData['your-name'].split(' ')
            await hubspotClient.addBasicB2CContact({
                firstName,
                lastName: lastName || '',
                email: formData['your-email'],
                branch: PartyFormLocationMap[formData.location],
                mobile: formData.phone,
            })
            break
        }

        case 'contact': {
            const formData = req.body as Form['contact']
            const [firstName, lastName] = formData['your-name'].split(' ')

            const service = formData.service

            if (service === 'Other') break
            if (
                service === 'Birthday Party' ||
                service === 'Holiday Program' ||
                service === 'School Science Program' ||
                service === 'Mini Science'
            ) {
                await hubspotClient.addBasicB2CContact({
                    firstName,
                    lastName,
                    email: formData['your-email'],
                    mobile: formData.phone,
                    ...(formData.location && { branch: ContactFormLocationMap[formData.location] }),
                })
            } else if (service === 'Activation and Events' || service === 'School Incursion') {
                await hubspotClient.addBasicB2BContact({
                    firstName,
                    lastName,
                    email: formData['your-email'],
                    mobile: formData.phone,
                    service: service === 'Activation and Events' ? 'activation_event' : 'incursion',
                })
            } else {
                logError(`Unrecognised service when submitting contct form 7 'contact' form: '${service}'`)
            }
            break
        }

        case 'event': {
            const formData = req.body as Form['event']
            const [firstName, lastName] = formData['your-name'].split(' ')
            await hubspotClient.addBasicB2BContact({
                firstName,
                lastName,
                email: formData['your-email'],
                service: 'activation_event',
                company: formData.company,
            })
            break
        }

        case 'incursion': {
            const formData = req.body as Form['incursion']
            const [firstName, lastName] = formData['your-name'].split(' ')
            await hubspotClient.addBasicB2BContact({
                firstName,
                lastName,
                email: formData['your-email'],
                mobile: formData.phone,
                service: 'incursion',
                company: formData.school,
            })
            break
        }

        default: {
            const exhaustiveCheck: never = formId
            logError(`Contact form 7 submitted with invalid formId: '${exhaustiveCheck}'`)
            break
        }
    }

    res.status(200).send()
    return
})
