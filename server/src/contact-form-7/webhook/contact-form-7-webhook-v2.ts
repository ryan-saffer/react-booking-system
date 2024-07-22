import { onRequest } from 'firebase-functions/v2/https'

import { MailClient } from '../../sendgrid/MailClient'
import { logError } from '../../utilities'
import { ZohoClient } from '../../zoho/zoho-client'
import {
    ContactFormLocationMap,
    Form,
    LocationDisplayValueMap,
    PartyFormLocationMap,
    ServiceDisplayValueMap,
} from '../contact-form-7-types-v2'

export const contactForm7WebhookV2 = onRequest(async (req, res) => {
    const formId = req.query.formId as keyof Form

    const zohoClient = new ZohoClient()
    const mailClient = await MailClient.getInstance()

    console.log(req.body)

    try {
        switch (formId) {
            case 'party-booking': {
                const formData = JSON.parse(req.body) as Form['party-booking']
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
                const formData = JSON.parse(req.body) as Form['contact']
                const [firstName, lastName] = formData['name'].split(' ')

                const service = formData.service

                await mailClient.sendEmail('websiteContactFormToCustomer', formData.email, {
                    name: formData.name,
                    email: formData.email,
                    contactNumber: formData.contactNumber,
                    service: ServiceDisplayValueMap[formData.service],
                    enquiry: formData.enquiry,
                    ...(formData.location && { location: LocationDisplayValueMap[formData.location] }),
                    preferredDateAndTime: formData.preferredDateAndTime,
                    suburb: formData.suburb,
                })
                await mailClient.sendEmail(
                    'websiteContactFormToFizz',
                    'bookings@fizzkidz.com.au',
                    {
                        name: formData.name,
                        email: formData.email,
                        contactNumber: formData.contactNumber,
                        service: ServiceDisplayValueMap[formData.service],
                        enquiry: formData.enquiry,
                        ...(formData.location && { location: LocationDisplayValueMap[formData.location] }),
                        preferredDateAndTime: formData.preferredDateAndTime,
                        suburb: formData.suburb,
                    },
                    {
                        subject: `${ServiceDisplayValueMap[formData.service]} - ${formData.name}`,
                        replyTo: formData.email,
                    }
                )

                if (service === 'other') break
                if (service === 'party' || service === 'holiday-program' || service === 'after-school-program') {
                    await zohoClient.addBasicB2CContact({
                        firstName,
                        lastName,
                        email: formData.email,
                        mobile: formData.contactNumber,
                        ...(formData.location && { studio: ContactFormLocationMap[formData.location] }),
                    })
                } else if (service === 'activation' || service === 'incursion') {
                    await zohoClient.addBasicB2BContact({
                        firstName,
                        lastName,
                        email: formData.email,
                        mobile: formData.contactNumber,
                        service: service === 'activation' ? 'activation_event' : 'incursion',
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
