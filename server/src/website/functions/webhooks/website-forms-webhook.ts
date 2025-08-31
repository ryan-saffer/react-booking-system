import express from 'express'
import { generateDiscountCode } from '@/holiday-programs/core/discount-codes/generate-discount-code'
import { MixpanelClient } from '@/mixpanel/mixpanel-client'
import { MailClient } from '@/sendgrid/MailClient'
import { logError } from '@/utilities'
import {
    type Form,
    LocationDisplayValueMap,
    ReferenceDisplayValueMap,
    PartyFormLocationMap,
    ServiceDisplayValueMap,
    ContactFormLocationMap,
    ModuleDisplayValueMap,
    RoleDisplayValueMap,
    FranchisingInterestDisplayValueMap,
} from '@/website/core/website-form-types'
import { ZohoClient } from '@/zoho/zoho-client'

export const websiteFormsWebhook = express.Router()

websiteFormsWebhook.post('/website', async (req, res) => {
    const formId = req.query.formId as keyof Form

    const zohoClient = new ZohoClient()
    const mailClient = await MailClient.getInstance()
    const mixpanelClient = await MixpanelClient.getInstance()

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
                        reference:
                            formData.reference === 'other' && formData.referenceOther
                                ? formData.referenceOther
                                : ReferenceDisplayValueMap[formData.reference],
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
                        reference:
                            formData.reference === 'other' && formData.referenceOther
                                ? formData.referenceOther
                                : ReferenceDisplayValueMap[formData.reference],
                    },
                    {
                        subject: `${LocationDisplayValueMap[formData.location]} - ${formData.name}`,
                        replyTo: formData.email,
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

                await mixpanelClient.track('website-enquiry', {
                    distinct_id: formData.email,
                    form: 'party',
                    service: 'party',
                    location: formData.location,
                    reference: formData.reference,
                    ...(formData.reference === 'other' &&
                        formData.referenceOther && { referenceOther: formData.referenceOther }),
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
                        reference:
                            formData.reference === 'other' && formData.referenceOther
                                ? formData.referenceOther
                                : ReferenceDisplayValueMap[formData.reference],
                    },
                    {
                        bccBookings: false,
                    }
                )
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
                        reference:
                            formData.reference === 'other' && formData.referenceOther
                                ? formData.referenceOther
                                : ReferenceDisplayValueMap[formData.reference],
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
                    // we still want the user to see a success here, so only log the error
                    logError(`Unrecognised service when submitting website 'contact' form: '${service}'`)
                }

                await mixpanelClient.track('website-enquiry', {
                    distinct_id: formData.email,
                    form: 'contact',
                    service,
                    location: formData.location,
                    reference: formData.reference,
                    ...(formData.reference === 'other' &&
                        formData.referenceOther && { referenceOther: formData.referenceOther }),
                })

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

                await mixpanelClient.track('website-enquiry', {
                    distinct_id: formData.email,
                    form: 'event',
                    service: 'activation',
                    reference: undefined,
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
                    'bookings@fizzkidz.com.au',
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

                await mixpanelClient.track('website-enquiry', {
                    distinct_id: formData.email,
                    form: 'incursion',
                    service: 'incursion',
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
                        location: formData.location ? LocationDisplayValueMap[formData.location] : '',
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
                        location: formData.location ? LocationDisplayValueMap[formData.location] : '',
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

                await mixpanelClient.track('website-enquiry', {
                    distinct_id: formData.email,
                    form: 'mailingList',
                })

                break
            }

            case 'holidayProgramDiscount': {
                const formData = req.body as Form['holidayProgramDiscount']
                const [firstName, lastName] = formData.name.split(' ')
                const data = await generateDiscountCode(firstName)
                await zohoClient.addBasicB2CContact({
                    firstName,
                    lastName,
                    email: formData.email,
                })
                await mixpanelClient.track('holiday-program-website-discount', {
                    name: formData.name,
                    distinct_id: formData.email,
                })

                res.status(200).json(data)
                return
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
