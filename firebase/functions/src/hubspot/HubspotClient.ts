import { Client } from '@hubspot/api-client'
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
    #client: Client

    constructor() {
        this.#client = new Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN })
    }

    #addContact(values: WithBaseProps<{ test_service: string } & { [key: string]: string }>) {
        const { firstName, lastName, email, mobile, ...rest } = values
        return this.#client.crm.contacts.basicApi.create({
            properties: {
                firstname: firstName,
                lastname: lastName,
                phone: mobile,
                email,
                ...rest,
                customer_type: 'B2C',
            },
            associations: [],
        })
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
export function getHubspotClient() {
    if (hubspotClient) return hubspotClient
    hubspotClient = new HubspotClient()
    return hubspotClient
}
