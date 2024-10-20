import { onRequest } from 'firebase-functions/v2/https'

import { MailClient } from '../../../sendgrid/MailClient'
import { logError } from '../../../utilities'
import { ZohoClient } from '../../../zoho/zoho-client'
import {
    ContactFormLocationMap,
    Form,
    FranchisingInterestDisplayValueMap,
    LocationDisplayValueMap,
    ModuleDisplayValueMap,
    PartyFormLocationMap,
    RoleDisplayValueMap,
    ServiceDisplayValueMap,
} from '../../core/website-form-types'

export const websiteFormsWebhook = onRequest(async (req, res) => {
    const formId = req.query.formId as keyof Form

    const zohoClient = new ZohoClient()
    const mailClient = await MailClient.getInstance()

    try {
        switch (formId) {
            case 'party': {
                const formData = JSON.parse(req.body) as Form['party']

                await mailClient.sendEmail(
                    'websitePartyFormToCustomer',
                    formData.email,
                    {
                        name: formData.name,
                        email: formData.email,
                        contactNumber: formData.contactNumber,
                        location: LocationDisplayValueMap[formData.location],
                        suburb: formData.suburb,
                        preferredDateAndTime: formData.preferredDateAndTime,
                        enquiry: formData.enquiry,
                    },
                    {
                        bccBookings: false,
                    }
                )

                await mailClient.sendEmail(
                    'websitePartyFormToFizz',
                    'bookings@fizzkidz.com.au',
                    {
                        name: formData.name,
                        email: formData.email,
                        contactNumber: formData.contactNumber,
                        location: LocationDisplayValueMap[formData.location],
                        suburb: formData.suburb,
                        preferredDateAndTime: formData.preferredDateAndTime,
                        enquiry: formData.enquiry,
                    },
                    {
                        subject: `${LocationDisplayValueMap[formData.location]} - ${formData.name}`,
                        replyTo: formData.email,
                        bccBookings: false,
                    }
                )

                const [firstName, lastName] = formData.name.split(' ')
                await zohoClient.addBasicB2CContact({
                    firstName,
                    lastName: lastName || '',
                    email: formData.email,
                    studio: PartyFormLocationMap[formData.location],
                    mobile: formData.contactNumber,
                })
                break
            }

            case 'contact': {
                const formData = JSON.parse(req.body) as Form['contact']
                const [firstName, lastName] = formData['name'].split(' ')

                const service = formData.service

                await mailClient.sendEmail(
                    'websiteContactFormToCustomer',
                    formData.email,
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
                        bccBookings: false,
                    }
                )
                await mailClient.sendEmail(
                    'websiteContactFormToFizz',
                    service === 'incursion' ? 'melissa@fizzkidz.com.au' : 'bookings@fizzkidz.com.au',
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
                        bccBookings: service === 'incursion', // bcc lami if sending to melissa for incursions
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
                    // we still want the user to see a success here, so only log the error
                    logError(`Unrecognised service when submitting website 'contact' form: '${service}'`)
                }
                break
            }

            case 'event': {
                const formData = JSON.parse(req.body) as Form['event']

                await mailClient.sendEmail(
                    'websiteEventFormToCustomer',
                    formData.email,
                    {
                        name: formData.name,
                        email: formData.email,
                        contactNumber: formData.contactNumber,
                        company: formData.company,
                        preferredDateAndTime: formData.preferredDateAndTime,
                        enquiry: formData.enquiry,
                    },
                    {
                        bccBookings: false,
                    }
                )
                await mailClient.sendEmail(
                    'websiteEventFormToFizz',
                    'bookings@fizzkidz.com.au',
                    {
                        name: formData.name,
                        email: formData.email,
                        contactNumber: formData.contactNumber,
                        company: formData.company,
                        preferredDateAndTime: formData.preferredDateAndTime,
                        enquiry: formData.enquiry,
                    },
                    {
                        subject: `Event - ${formData.name}`,
                        replyTo: formData.email,
                        bccBookings: false,
                    }
                )

                const [firstName, lastName] = formData.name.split(' ')
                await zohoClient.addBasicB2BContact({
                    firstName,
                    lastName,
                    email: formData.email,
                    service: 'activation_event',
                    company: formData.company,
                })
                break
            }

            case 'incursion': {
                const formData = JSON.parse(req.body) as Form['incursion']

                await mailClient.sendEmail(
                    'websiteIncurionFormToCustomer',
                    formData.email,
                    {
                        name: formData.name,
                        school: formData.school,
                        email: formData.email,
                        contactNumber: formData.contactNumber,
                        preferredDateAndTime: formData.preferredDateAndTime,
                        module: ModuleDisplayValueMap[formData.module],
                        enquiry: formData.enquiry,
                    },
                    {
                        bccBookings: false,
                    }
                )
                await mailClient.sendEmail(
                    'websiteIncurionFormToFizz',
                    'melissa@fizzkidz.com.au',
                    {
                        name: formData.name,
                        school: formData.school,
                        email: formData.email,
                        contactNumber: formData.contactNumber,
                        preferredDateAndTime: formData.preferredDateAndTime,
                        module: ModuleDisplayValueMap[formData.module],
                        enquiry: formData.enquiry,
                    },
                    {
                        subject: `Incursion - ${formData.name}, ${formData.school}`,
                        replyTo: formData.email,
                        bccBookings: true,
                    }
                )

                const [firstName, lastName] = formData.name.split(' ')
                await zohoClient.addBasicB2BContact({
                    firstName,
                    lastName,
                    email: formData.email,
                    mobile: formData.contactNumber,
                    service: 'incursion',
                    company: formData.school,
                })
                break
            }

            case 'careers': {
                const formData = JSON.parse(req.body) as Form['careers']

                await mailClient.sendEmail(
                    'websiteCareersFormToCustomer',
                    formData.email,
                    {
                        name: formData.name,
                        email: formData.email,
                        contactNumber: formData.contactNumber,
                        role: RoleDisplayValueMap[formData.role],
                        wwcc: formData.wwcc,
                        driversLicense: formData.driversLicense,
                        resumeUrl: formData.resume.url,
                        resumeFilename: formData.resume.name,
                        application: formData.application,
                        reference: formData.reference,
                    },
                    {
                        bccBookings: false,
                    }
                )

                await mailClient.sendEmail(
                    'websiteCareersFormToFizz',
                    'people@fizzkidz.com.au',
                    {
                        name: formData.name,
                        email: formData.email,
                        contactNumber: formData.contactNumber,
                        role: RoleDisplayValueMap[formData.role],
                        wwcc: formData.wwcc,
                        driversLicense: formData.driversLicense,
                        resumeFilename: formData.resume.name,
                        resumeUrl: formData.resume.url,
                        application: formData.application,
                        reference: formData.reference,
                    },
                    {
                        subject: `${formData.name} - Job Application`,
                        replyTo: formData.email,
                        bccBookings: false,
                    }
                )
                break
            }

            case 'mailingList': {
                const formData = JSON.parse(req.body) as Form['mailingList']

                const [firstName, lastName] = formData.name.split(' ')

                await zohoClient.addBasicB2CContact({
                    firstName,
                    lastName,
                    email: formData.email,
                })
                break
            }

            case 'franchising': {
                const formData = JSON.parse(req.body) as Form['franchising']

                await mailClient.sendEmail(
                    'websiteFranchisingFormToCustomer',
                    formData.email,
                    {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        contactNumber: formData.contactNumber,
                        suburb: formData.suburb,
                        state: formData.state,
                        experience: formData.experience,
                        interest: FranchisingInterestDisplayValueMap[formData.interest],
                        enquiry: formData.enquiry,
                        reference: formData.reference,
                    },
                    {
                        bccBookings: false,
                    }
                )

                await mailClient.sendEmail(
                    'websiteFranchisingFormToFizz',
                    'info@fizzkidz.com.au',
                    {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        contactNumber: formData.contactNumber,
                        suburb: formData.suburb,
                        state: formData.state,
                        experience: formData.experience,
                        interest: FranchisingInterestDisplayValueMap[formData.interest],
                        enquiry: formData.enquiry,
                        reference: formData.reference,
                    },
                    {
                        subject: `${formData.firstName} ${formData.lastName} - ${formData.suburb}, ${formData.state}`,
                        replyTo: formData.email,
                        bccBookings: false,
                    }
                )

                break
            }

            default: {
                const exhaustiveCheck: never = formId
                // we always want to send a 200 to the wordpress plugin, so only log the error
                logError(`Website form submitted with invalid formId: '${exhaustiveCheck}'`)
                res.status(500).send()
                return
            }
        }
    } catch (err) {
        logError(`Error running website form webhook with id: ${formId}`, err, req.body)
        res.status(500).send()
        return
    }

    res.status(200).send()
    return
})
