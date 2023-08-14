import type { Client as TClient } from '@hubspot/api-client'
import { Branch, Locations, Acuity } from 'fizz-kidz'
import { DateTime } from 'luxon'

type BaseProps = {
    firstName: string
    lastName: string
    email: string
    mobile: string
}
type WithBaseProps<T> = BaseProps & T

class HubspotClient {
    #client: TClient | null = null

    get #hubspot() {
        if (this.#client) return this.#client
        throw new Error('Hubspot client not initialised')
    }

    async _initialise() {
        const { Client } = await import('@hubspot/api-client')
        this.#client = new Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN })
    }

    async #addContact(values: WithBaseProps<{ test_service: string } & { [key: string]: string }>) {
        const { firstName, lastName, email, mobile, ...rest } = values

        const properties = {
            firstname: firstName,
            lastname: lastName,
            phone: mobile,
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
            service: 'in-store' | 'mobile'
            partyDate: Date
            location: Locations
        }>
    ) {
        const { childName, childAge, service, partyDate, location, ...baseProps } = props
        return this.#addContact({
            child_name: childName,
            child_age: childAge,
            test_service: service === 'in-store' ? 'In-store Party' : 'Mobile Party',
            party_date: DateTime.fromJSDate(partyDate).toISODate(),
            party_location: this.#getBranch(location),
            ...baseProps,
        })
    }

    addHolidayProgramContact(props: WithBaseProps<{ location: Locations }>) {
        const { location, ...baseProps } = props
        return this.#addContact({
            test_service: 'Holiday Program',
            party_location: this.#getBranch(location),
            ...baseProps,
        })
    }

    addScienceProgramContact(props: WithBaseProps<{ calendarId: number }>) {
        const { calendarId, ...baseProps } = props
        return this.#addContact({
            party_location: Acuity.Utilities.getSchoolByCalendarId(calendarId),
            test_service: 'School Science Program',
            ...baseProps,
        })
    }

    #getBranch(location: Locations): Branch {
        switch (location) {
            case Locations.BALWYN:
                return 'Balwyn'
            case Locations.CHELTENHAM:
                return 'Cheltenham'
            case Locations.ESSENDON:
                return 'Essendon'
            case Locations.MALVERN:
                return 'Malvern'
            case Locations.MOBILE:
                return 'Mobile'
            default: {
                const exhaustiveCheck: never = location
                throw new Error(`unrecognised location: '${exhaustiveCheck}'`)
            }
        }
    }
}

let hubspotClient: HubspotClient
export async function getHubspotClient() {
    if (hubspotClient) return hubspotClient
    hubspotClient = new HubspotClient()
    await hubspotClient._initialise()
    return hubspotClient
}
