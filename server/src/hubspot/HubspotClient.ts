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

    async #addContact(values: WithBaseProps<{ test_service: string } & { [key: string]: string }>) {
        const { firstName, lastName, email, mobile, ...rest } = values

        const properties = {
            firstname: firstName,
            lastname: lastName || '',
            phone: mobile || '',
            email,
            ...rest,
            customer_type: 'B2C',
        }

        try {
            await this.#hubspot.crm.contacts.basicApi.create({
                properties,
                associations: [],
            })
        } catch (err: any) {
            if (err.code === 409) {
                // a way to update by email address. See 'Please note' section - https://developers.hubspot.com/docs/api/crm/contacts
                // this isn't ideal, since properties that allow multiple values will be overwritten here with a single value.
                // ie. if a birthday party guest signs up for a holiday program, their service will only be holiday program, and not both party and holiday program.
                // can improve by first fetching the existing customer, and merging such fields.
                await this.#hubspot.apiRequest({
                    method: 'PATCH',
                    path: `/crm/v3/objects/contacts/${email}?idProperty=email`,
                    body: {
                        properties,
                    },
                })
            } else {
                throw err
            }
        }
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
            ...baseProps,
        })
    }

    // when getting a discount code from our invitations
    addBirthdayPartyGuestContact(props: BaseProps) {
        return this.#addContact({
            test_service: 'brithday_party_guest',
            firstName: props.firstName,
            email: props.email,
        })
    }

    addHolidayProgramContact(props: WithBaseProps<{ location: Location }>) {
        const { location, ...baseProps } = props
        return this.#addContact({
            test_service: 'Holiday Program',
            party_location: this.#getBranch(location),
            ...baseProps,
        })
    }

    addScienceProgramContact(props: WithBaseProps<{ calendarId: number; type: 'science' | 'art' }>) {
        const { calendarId, type, ...baseProps } = props
        return this.#addContact({
            party_location: AcuityUtilities.getSchoolByCalendarId(calendarId),
            test_service: type === 'science' ? 'School Science Program' : 'Art Program',
            ...baseProps,
        })
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
