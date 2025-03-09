import { logger } from 'firebase-functions/v2'
import { InvitationOption, type Location } from 'fizz-kidz'
import type { Mixpanel } from 'mixpanel'

import { env } from '../init'
import { ClientStatus } from '../utilities/types'
import type {
    ContactFormLocationOption,
    ContactFormServiceOption,
    Form,
    ReferenceOption,
} from '../website/core/website-form-types'

export class MixpanelClient {
    private static instance: MixpanelClient
    #status: ClientStatus = 'not-initialised'

    #mixpanelClient: Mixpanel | null = null

    private constructor() {}

    static async getInstance(): Promise<MixpanelClient> {
        if (!MixpanelClient.instance) {
            MixpanelClient.instance = new MixpanelClient()
            await MixpanelClient.instance.#initialise()
        }
        while (MixpanelClient.instance.#status === 'initialising') {
            await new Promise((resolve) => setTimeout(resolve, 20))
        }
        return MixpanelClient.instance
    }

    get #mixpanel() {
        if (this.#mixpanelClient) return this.#mixpanelClient
        throw new Error('Mixpanel client not initialised')
    }

    async #initialise() {
        this.#status = 'initialising'
        const Mixpanel = await import('mixpanel')
        this.#mixpanelClient = Mixpanel.init(
            env === 'dev' ? process.env.MIXPANEL_API_KEY_DEV : process.env.MIXPANEL_API_KEY_PROD
        )
        this.#status = 'initialised'
    }

    track<T extends keyof MixpanelEvent>(event: T, properties: MixpanelEvent[T]) {
        return new Promise<void>((resolve) => {
            this.#mixpanel.track(EventNameMap[event], properties, (err) => {
                if (err) {
                    logger.warn(`An error occurred tracking the mixpanel event: '${event}'`, { err })
                }
                resolve()
            })
        })
    }
}

export type MixpanelEvent = {
    'invitation-generated': { invitationId: string; partyDate: Date; invitation: InvitationOption }
    'invitation-coupon-signup': {
        invitationId: string
        view: // used the sidebar on desktop
        | 'sidebar'
            // used the mobile drawer
            | 'drawer'
            // used the section just sitting under the invite on mobile (no drawer)
            | 'scroll'
    }
    'holiday-program-website-discount': { name: string; email: string }
    'website-enquiry': {
        form: keyof Form
        service?: ContactFormServiceOption
        location?: ContactFormLocationOption
        reference?: ReferenceOption
        referenceOther?: string
    }
    'holiday-program-booking': {
        distinct_id: string
        location: Location
        numberOfSlots: number
    }
}

const EventNameMap: Record<keyof MixpanelEvent, string> = {
    'invitation-generated': 'Invitation Generated',
    'invitation-coupon-signup': 'Invitation Coupon Code Signup',
    'holiday-program-website-discount': 'Website Holiday Program Discount Generated',
    'website-enquiry': 'Website Enquiry',
    'holiday-program-booking': 'Holiday Program Booking',
}
