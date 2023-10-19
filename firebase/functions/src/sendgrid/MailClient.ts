import type { Emails } from './types'
import fs from 'fs'
import path from 'path'
import type { MailService } from '@sendgrid/mail'
import type { MailData } from '@sendgrid/helpers/classes/mail'
import { env } from '../init'

import Mustache from 'mustache'
import { ClientStatus } from '../utilities/types'

type Options = {
    from?: {
        name: string
        email: string
    }
    subject?: string
    replyTo?: string
}

export class MailClient {
    private static instance: MailClient
    #status: ClientStatus = 'not-initialised'

    #client: MailService | null = null

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}

    static async getInstance() {
        if (!MailClient.instance) {
            MailClient.instance = new MailClient()
            await MailClient.instance.#initialise()
        }
        while (MailClient.instance.#status === 'initialising') {
            await new Promise((resolve) => setTimeout(resolve, 20))
        }
        return MailClient.instance
    }

    async #initialise() {
        this.#status = 'initialising'
        const sgMail = await import('@sendgrid/mail')
        this.#client = sgMail.default
        this.#client.setApiKey(process.env.SEND_GRID_API_KEY)
        this.#status = 'initialised'
    }

    get #sgMail() {
        if (this.#client) return this.#client
        throw new Error('Mail client not initialised')
    }

    async sendEmail<T extends keyof Emails>(email: T, to: string, values: Emails[T], options: Options = {}) {
        console.log('generating html...')
        const { emailInfo, template, useMjml } = this._getInfo(email, to, options)
        const html = await this._generateHtml(template, values, useMjml)
        console.log('generated successfully!')
        console.log('sending email...')
        await this.#sgMail.send({ ...emailInfo, html, ...(env === 'prod' && { bcc: 'bookings@fizzkidz.com.au' }) })
        console.log('email sent successfully!')
    }

    private async _generateHtml(template: string, values: Record<string, unknown>, useMjml: boolean): Promise<string> {
        const mjml = fs.readFileSync(path.resolve(__dirname, `sendgrid/mjml/${template}`), 'utf-8')
        const output = Mustache.render(mjml, values)
        if (useMjml) {
            const mjml2html = await import('mjml')
            const mjmlOutput = mjml2html.default(output)
            if (mjmlOutput.errors.length > 0) {
                mjmlOutput.errors.forEach((error) => {
                    console.log(error.formattedMessage)
                })
                console.log('error converting mjml to html')
                throw new Error('error converting mjml to html')
            } else {
                return mjmlOutput.html
            }
        } else {
            return output
        }
    }

    private _getInfo<T extends keyof Emails>(
        email: T,
        to: string,
        options: Options
    ): {
        emailInfo: MailData & { to: string; from: { name: string; email: string }; subject: string; replyTo: string }
        template: string
        useMjml: boolean
    } {
        const { from, subject, replyTo } = options
        switch (email) {
            case 'holidayProgramConfirmation':
                return {
                    emailInfo: {
                        to,
                        from: {
                            name: 'Fizz Kidz',
                            email: 'bookings@fizzkidz.com.au',
                        },
                        subject: subject || 'Holiday program booking confirmation',
                        replyTo: replyTo || 'bookings@fizzkidz.com.au',
                    },
                    template: 'holiday_program_confirmation.mjml',
                    useMjml: true,
                }
            case 'scienceTermEnrolmentConfirmation':
                return {
                    emailInfo: {
                        to,
                        from: {
                            name: 'Fizz Kidz',
                            email: 'bookings@fizzkidz.com.au',
                        },
                        subject: subject || 'Science Program Enrolment Confirmation',
                        replyTo: replyTo || 'bookings@fizzkidz.com.au',
                    },
                    template: 'science_term_enrolment_confirmation.html',
                    useMjml: true,
                }
            case 'termContinuationEmail':
                return {
                    emailInfo: {
                        to,
                        from: {
                            name: 'Fizz Kidz',
                            email: 'bookings@fizzkidz.com.au',
                        },
                        subject: subject || 'Thanks for coming to your first session!',
                        replyTo: replyTo || 'bookings@fizzkidz.com.au',
                    },
                    template: 'term_continuation_email.html',
                    useMjml: true,
                }
            case 'scienceTermUnenrolmentConfirmation':
                return {
                    emailInfo: {
                        to,
                        from: {
                            name: 'Fizz Kidz',
                            email: 'bookings@fizzkidz.com.au',
                        },
                        subject: subject || 'Unenrolment Confirmation',
                        replyTo: replyTo || 'bookings@fizzkidz.com.au',
                    },
                    template: 'term_unenrolment_confirmation.html',
                    useMjml: true,
                }
            case 'scienceParentPortalLink':
                return {
                    emailInfo: {
                        to,
                        from: {
                            name: 'Fizz Kidz',
                            email: 'bookings@fizzkidz.com.au',
                        },
                        subject: subject || 'Manage your enrolment',
                        replyTo: replyTo || 'bookings@fizzkidz.com.au',
                    },
                    template: 'science_parent_portal.html',
                    useMjml: true,
                }
            case 'partyFormFilledInAgain':
                return {
                    emailInfo: {
                        to,
                        from: {
                            name: 'Fizz Kidz',
                            email: 'info@fizzkidz.com.au',
                        },
                        subject: subject || 'Party form filled in again!',
                        replyTo: replyTo || 'info@fizzkidz.com.au',
                    },
                    template: 'party_form_filled_in_again.html',
                    useMjml: false,
                }
            case 'eventBooking':
                return {
                    emailInfo: {
                        to,
                        from: {
                            name: 'Fizz Kidz',
                            email: 'bookings@fizzkidz.com.au',
                        },
                        bcc: 'programs@fizzkidz.com.au',
                        subject: subject || 'Fizz Kidz Booking Confirmation',
                        replyTo: replyTo || 'programs@fizzkidz.com.au',
                    },
                    template: 'event_booking_confirmation.html',
                    useMjml: true,
                }
            case 'partyBookingConfirmation':
                return {
                    emailInfo: {
                        to,
                        from: {
                            name: 'Fizz Kidz',
                            email: 'bookings@fizzkidz.com.au',
                        },
                        subject: subject || 'Party Booking Confirmation',
                        replyTo: replyTo || 'bookings@fizzkidz.com.au',
                    },
                    template: 'party_booking_confirmation.mjml',
                    useMjml: true,
                }
            case 'partyForm':
                return {
                    emailInfo: {
                        to,
                        from: from || {
                            name: 'Fizz Kidz',
                            email: 'bookings@fizzkidz.com.au',
                        },
                        subject: subject || 'Your party is coming up!',
                        replyTo: replyTo || 'bookings@fizzkidz.com.au',
                    },
                    template: 'party_form.html',
                    useMjml: true,
                }
            case 'tooManyCreationsChosen':
                return {
                    emailInfo: {
                        to,
                        from: {
                            name: 'Fizz Kidz',
                            email: 'info@fizzkidz.com.au',
                        },
                        subject: subject || 'Too many creations chosen!',
                        replyTo: replyTo || 'info@fizzkidz.com.au',
                    },
                    template: 'too_many_creations_chosen.html',
                    useMjml: false,
                }
            case 'partyFormQuestions':
                return {
                    emailInfo: {
                        to,
                        from: {
                            name: 'Fizz Kidz',
                            email: 'info@fizzkidz.com.au',
                        },
                        subject: subject || 'Questions asked in party form!',
                        replyTo: replyTo || 'bookings@fizzkidz.com.au',
                    },
                    template: 'party_form_questions.html',
                    useMjml: false,
                }
            case 'partyPackNotification':
                return {
                    emailInfo: {
                        to,
                        from: {
                            name: 'Fizz Kidz',
                            email: 'info@fizzkidz.com.au',
                        },
                        subject: subject || 'Party packs ordered!',
                        replyTo: replyTo || 'bookings@fizzkidz.com.au',
                    },
                    template: 'party_pack_notification.html',
                    useMjml: false,
                }
            case 'partyFormConfirmation':
                return {
                    emailInfo: {
                        to,
                        from: from || {
                            name: 'Fizz Kidz',
                            email: 'bookings@fizzkidz.com.au',
                        },
                        subject: subject || 'Your Party Details',
                        replyTo: replyTo || 'bookings@fizzkidz.com.au',
                    },
                    template: 'party_form_completed.html',
                    useMjml: true,
                }
            case 'partyFeedback':
                return {
                    emailInfo: {
                        to,
                        from: {
                            name: 'Fizz Kidz',
                            email: 'bookings@fizzkidz.com.au',
                        },
                        subject: 'Review your Fizz Kidz experience and WIN!',
                        replyTo: 'bookings@fizzkidz.com.au',
                    },
                    template: 'party_feedback.html',
                    useMjml: true,
                }
            case 'onboarding':
                return {
                    emailInfo: {
                        to,
                        bcc: 'people@fizzkidz.com.au',
                        from: {
                            name: 'Fizz Kidz',
                            email: 'people@fizzkidz.com.au',
                        },
                        subject: subject || 'Fizz Kidz Onboarding',
                        replyTo: replyTo || 'people@fizzkidz.com.au',
                    },
                    template: 'onboarding.html',
                    useMjml: true,
                }
            default: {
                const exhaustiveCheck: never = email
                throw new Error(`Unrecognised email template: ${exhaustiveCheck}`)
            }
        }
    }
}
