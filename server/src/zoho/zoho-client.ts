import { Booking, Location, capitalise } from 'fizz-kidz'
import { DateTime } from 'luxon'

type BaseProps = {
    firstName: string
    lastName?: string
    email: string
    mobile?: string
}

type WithBaseProps<T> = BaseProps & T

type Service =
    | 'Birthday Party'
    | 'Holiday Program'
    | 'Birthday Party Guest'
    | 'After School Program'
    | 'Activation / Event'
    | 'Incursion'
    | ''

export class ZohoClient {
    #accessToken = null

    async #refreshAccessToken() {
        const result = await fetch(
            `https://accounts.zoho.com.au/oauth/v2/token?refresh_token=${process.env.ZOHO_REFRESH_TOKEN}&client_id=${process.env.ZOHO_CLIENT_ID}&client_secret=${process.env.ZOHO_CLIENT_SECRET}&grant_type=refresh_token`,
            { method: 'POST' }
        )
        if (result.ok) {
            const body = await result.json()
            this.#accessToken = body.access_token
        }
    }

    async #request(
        props: { endpoint: string; method: 'GET' } | { endpoint: string; method: 'POST'; data: Record<string, any>[] }
    ) {
        const request = () =>
            fetch(`https://www.zohoapis.com.au/crm/v6/${props.endpoint}`, {
                headers: {
                    Authorization: `Zoho-oauthtoken ${this.#accessToken}`,
                },
                method: props.method,
                ...(props.method === 'POST' && {
                    body: JSON.stringify({ data: props.data }),
                }),
            })

        // try request first, and see if it works.
        // if not refresh the access token and try again.
        let result
        result = await request()
        if (result.ok) {
            return result.json()
        } else if (result.status === 401) {
            // invalid oauth token, refresh the token and try again
            await this.#refreshAccessToken()
            result = await request()
        }

        // and if it still doesnt work, just error out
        if (result.ok) {
            return result.json()
        } else {
            const error = await result.json()
            throw error
        }
    }

    async #addContact(
        values: WithBaseProps<{
            service: Service
            customer_type: 'B2C' | 'B2B'
            branch?: string
            Party_Type?: 'Studio' | 'Mobile' | ''
            Party_Date?: string
            Company?: string
        }>
    ) {
        const { firstName, lastName, email, mobile, service, customer_type, branch, ...rest } = values

        const properties = {
            firstname: firstName,
            lastname: lastName || 'N/A',
            phone: mobile || '',
            email,
            service,
            customer_type,
            branch: branch || '',
            ...rest,
        }

        await this.#request({
            endpoint: 'Contacts/upsert',
            method: 'POST',
            data: [
                {
                    First_Name: properties.firstname,
                    Last_Name: properties.lastname,
                    Phone: properties.phone,
                    Email: properties.email,
                    Service: [properties.service],
                    Customer_Type: properties.customer_type,
                    Branch: [properties.branch],
                    ...rest,
                    $append_values: {
                        Service: true,
                        Branch: true,
                    },
                },
            ],
        })
    }

    addBirthdayPartyContact(props: WithBaseProps<{ type: Booking['type']; studio: Location; partyDate: Date }>) {
        const { type, studio, partyDate, ...baseProps } = props

        return this.#addContact({
            service: 'Birthday Party',
            Party_Type: type === 'studio' ? 'Studio' : type === 'mobile' ? 'Mobile' : '',
            customer_type: 'B2C',
            branch: capitalise(studio),
            Party_Date: DateTime.fromJSDate(partyDate).toISODate(),
            ...baseProps,
        })
    }

    addBirthdayPartyGuestContact(props: BaseProps) {
        return this.#addContact({
            service: 'Birthday Party Guest',
            customer_type: 'B2C',
            ...props,
        })
    }

    addHolidayProgramContact(props: WithBaseProps<{ studio: Location }>) {
        const { studio, ...baseProps } = props
        return this.#addContact({
            service: 'Holiday Program',
            branch: capitalise(studio),
            customer_type: 'B2C',
            ...baseProps,
        })
    }

    addAfterSchoolProgramContact(props: BaseProps) {
        return this.#addContact({
            service: 'After School Program',
            customer_type: 'B2C',
            ...props,
        })
    }

    addBasicB2CContact(props: WithBaseProps<{ studio?: Location | undefined }>) {
        const { studio, ...baseProps } = props
        return this.#addContact({ service: '', branch: capitalise(studio || ''), customer_type: 'B2C', ...baseProps })
    }

    addBasicB2BContact(props: WithBaseProps<{ service: 'incursion' | 'activation_event'; company?: string }>) {
        const { service, company, ...baseProps } = props

        return Promise.all([
            this.#addContact({
                service: service === 'incursion' ? 'Incursion' : 'Activation / Event',
                customer_type: 'B2B',
                Company: company || '',
                ...baseProps,
            }),
            this.createLead({
                company: company || '',
                source: 'Website Form',
                ...baseProps,
            }),
        ])
    }

    createLead(props: WithBaseProps<{ company: string; source: string }>) {
        return this.#request({
            endpoint: 'Leads',
            method: 'POST',
            data: [
                {
                    First_Name: props.firstName,
                    Last_Name: props.lastName || 'N/A',
                    Email: props.email,
                    Phone: props.mobile || '',
                    Company: props.company,
                    Owner: '76392000000284519', // melissa
                    Lead_Source: props.source,
                    Lead_Status: 'Not Qualified',
                },
            ],
        })
    }
}
