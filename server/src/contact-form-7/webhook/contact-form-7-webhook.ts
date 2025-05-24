import { onRequest } from 'firebase-functions/v2/https'

import { logError } from '../../utilities'
import { ZohoClient } from '../../zoho/zoho-client'
import type { Form } from '../contact-form-7-types'
import { ContactFormLocationMap, PartyFormLocationMap } from '../contact-form-7-types'

export const contactForm7Webhook = onRequest(async (req, res) => {
    const formId = req.query.formId as keyof Form

    const zohoClient = new ZohoClient()

    try {
        switch (formId) {
            case 'party-booking': {
                const formData = req.body as Form['party-booking']
                const [firstName, lastName] = formData['your-name'].split(' ')
                await zohoClient.addBasicB2CContact({
                    firstName,
                    lastName: lastName || '',
                    email: formData['your-email'],
                    studio: PartyFormLocationMap[formData.location],
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
                    await zohoClient.addBasicB2CContact({
                        firstName,
                        lastName,
                        email: formData['your-email'],
                        mobile: formData.phone,
                        ...(formData.location && { studio: ContactFormLocationMap[formData.location] }),
                    })
                } else if (service === 'Activation and Events' || service === 'School Incursion') {
                    await zohoClient.addBasicB2BContact({
                        firstName,
                        lastName,
                        email: formData['your-email'],
                        mobile: formData.phone,
                        service: service === 'Activation and Events' ? 'activation_event' : 'incursion',
                    })
                } else {
                    // we always want to send a 200 to the wordpress plugin, so only log the error
                    logError(`Unrecognised service when submitting contct form 7 'contact' form: '${service}'`)
                }
                break
            }

            case 'event': {
                const formData = req.body as Form['event']
                const [firstName, lastName] = formData['your-name'].split(' ')
                await zohoClient.addBasicB2BContact({
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
                await zohoClient.addBasicB2BContact({
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
                // we always want to send a 200 to the wordpress plugin, so only log the error
                logError(`Contact form 7 submitted with invalid formId: '${exhaustiveCheck}'`)
                break
            }
        }
    } catch (err) {
        logError('error handling contact form 7 submission', JSON.stringify(err))
    }

    res.status(200).send()
    return
})
