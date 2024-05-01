import { AcuityUtilities, Booking, Branch, Location } from 'fizz-kidz'
import { DateTime } from 'luxon'

import type { Client as TClient } from '@hubspot/api-client'

import { ClientStatus } from '../utilities/types'

type BaseProps = {
    firstName: string
    lastName?: string
    email: string
    mobile?: string
}

type WithBaseProps<T> = BaseProps & T

export class HubspotClient {
    private static instance: HubspotClient
    #status: ClientStatus = 'not-initialised'

    #client: TClient | null = null

    private constructor() {}

    static async getInstance() {
        if (!HubspotClient.instance) {
            HubspotClient.instance = new HubspotClient()
            await HubspotClient.instance.#initialise()
        }
        while (HubspotClient.instance.#status === 'initialising') {
            await new Promise((resolve) => setTimeout(resolve, 20))
        }
        return HubspotClient.instance
    }

    async #initialise() {
        this.#status = 'initialising'
        const { Client } = await import('@hubspot/api-client')
        this.#client = new Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN })
        this.#status = 'initialised'
    }

    get #hubspot() {
        if (this.#client) return this.#client
        throw new Error('Hubspot client not initialised')
    }

    async #addContact(
        values: WithBaseProps<{ test_service: string; customer_type: 'B2C' | 'B2B' } & { [key: string]: string }>
    ) {
        const { firstName, lastName, email, mobile, ...rest } = values

        const properties = {
            firstname: firstName,
            lastname: lastName || '',
            phone: mobile || '',
            email,
            ...rest,
        }

        try {
            return this.#hubspot.crm.contacts.basicApi.create({
                properties,
                associations: [],
            })
        } catch (err: any) {
            if (err.code === 409) {
                // a way to update by email address. See 'Please note' section - https://developers.hubspot.com/docs/api/crm/contacts
                // this isn't ideal, since properties that allow multiple values will be overwritten here with a single value.
                // ie. if a birthday party guest signs up for a holiday program, their service will only be holiday program, and not both party and holiday program.
                // can improve by first fetching the existing customer, and merging such fields.
                const result = await this.#hubspot.apiRequest({
                    method: 'PATCH',
                    path: `/crm/v3/objects/contacts/${email}?idProperty=email`,
                    body: {
                        properties,
                    },
                })
                return result.json()
            } else {
                throw err
            }
        }
    }

    #addDeal(dealName: string, conatactId: string) {
        this.#hubspot.crm.deals.basicApi.create({
            properties: {
                dealname: dealName,
                pipeline: 'default',
                dealstage: 'appointmentscheduled',
                hubspot_owner_id: '899046703', // melissa
            },
            associations: [
                {
                    to: {
                        id: conatactId,
                    },
                    types: [
                        {
                            associationCategory: 'HUBSPOT_DEFINED',
                            associationTypeId: 3, // deal to contact
                        },
                    ],
                },
            ],
        })
    }

    addBirthdayPartyContact(
        props: WithBaseProps<{
            childName: string
            childAge: string
            service: Booking['type']
            partyDate: Date
            location: Location
        }>
    ) {
        const { childName, childAge, service, partyDate, location, ...baseProps } = props
        return this.#addContact({
            child_name: childName,
            child_age: childAge,
            test_service: service === 'studio' ? 'In-store Party' : 'Mobile Party',
            party_date: DateTime.fromJSDate(partyDate).toISODate(),
            party_location: this.#getBranch(location),
            customer_type: 'B2C',
            ...baseProps,
        })
    }

    // when getting a discount code from our invitations
    addBirthdayPartyGuestContact(props: BaseProps) {
        return this.#addContact({
            test_service: 'brithday_party_guest',
            firstName: props.firstName,
            email: props.email,
            customer_type: 'B2C',
        })
    }

    addHolidayProgramContact(props: WithBaseProps<{ location: Location }>) {
        const { location, ...baseProps } = props
        return this.#addContact({
            test_service: 'Holiday Program',
            party_location: this.#getBranch(location),
            customer_type: 'B2C',
            ...baseProps,
        })
    }

    addScienceProgramContact(props: WithBaseProps<{ calendarId: number; type: 'science' | 'art' }>) {
        const { calendarId, type, ...baseProps } = props
        return this.#addContact({
            party_location: AcuityUtilities.getSchoolByCalendarId(calendarId),
            test_service: type === 'science' ? 'School Science Program' : 'Art Program',
            customer_type: 'B2C',
            ...baseProps,
        })
    }

    addBasicB2CContact(props: WithBaseProps<{ branch?: Location }>) {
        const { branch, ...rest } = props
        return this.#addContact({
            ...rest,
            customer_type: 'B2C',
            test_service: '',
            ...(branch && { party_location: this.#getBranch(branch) }),
        })
    }

    async addBasicB2BContact(props: WithBaseProps<{ service: 'incursion' | 'activation_event'; company?: string }>) {
        const { service, ...rest } = props
        const contact = await this.#addContact({
            ...rest,
            test_service: service,
            customer_type: 'B2B',
            hs_lead_status: 'NEW',
        })
        await this.#addDeal('New contact form lead', contact?.id || '')
    }

    #getBranch(location: Location): Branch {
        switch (location) {
            case Location.BALWYN:
                return 'Balwyn'
            case Location.CHELTENHAM:
                return 'Cheltenham'
            case Location.ESSENDON:
                return 'Essendon'
            case Location.MALVERN:
                return 'Malvern'
            default: {
                const exhaustiveCheck: never = location
                throw new Error(`unrecognised location: '${exhaustiveCheck}'`)
            }
        }
    }
}
