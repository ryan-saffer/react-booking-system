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
        props: { endpoint: string; method: 'GET' } | { endpoint: string; method: 'POST'; data: Record<string, any>[] },
        retryCount = 1
    ): Promise<any> {
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
        const result = await request()
        if (result.ok) {
            if (result.status === 204) {
                // no content
                return null
            }
            return result.json()
        } else if (result.status === 401 && retryCount === 1) {
            // invalid oauth token, refresh the token and try again
            await this.#refreshAccessToken()
            return this.#request(props, retryCount - 1)
        } else {
            const error = await result.json()
            throw error
        }
    }

    /**
     * This method will specifically first GET the customer, and then check their childrens birthdays,
     * to see if they already exist, and insert the child wherever there is a free slot.
     */
    async #addParentWithChild(
        values: WithBaseProps<{
            service: Service
            customer_type: 'B2C' | 'B2B'
            childName: string
            childBirthdayISO: string // !! ISO date string
            branch?: string
            Party_Type?: 'Studio' | 'Mobile' | ''
            Party_Date?: string
            Company?: string
        }>
    ) {
        const { childName, childBirthdayISO, ...rest } = values

        const childBirthday = childBirthdayISO.split('T')[0]

        const searchResult = await this.#request({
            endpoint: `Contacts/search?email=${encodeURIComponent(values.email)})`,
            method: 'GET',
        })

        if (!searchResult) {
            // customer does not exist in zoho, so add them as new with the child
            console.log('Customer does not exist in zoho - Adding new!')
            return this.#upsertContact({ ...rest, Child_Birthday_1: childBirthday, Child_Name_1: childName })
        }

        console.log('Customer found in zoho!')

        // otherwise, get the existing customer (safe to do first entry since no duplicate emails allowed in zoho)
        const existingContact = searchResult.data[0]

        const availableFields = {
            // used to know which slot to put the child if they are new.
            child1: true,
            child2: true,
            child3: true,
            child4: true,
            child5: true,
        }

        // search through all 5 children fields in zoho, to see if this child is already added against this parent.
        // do this by comparing against the childs birthday.
        // if no match found, we can add this child into zoho, otherwise don't.
        for (let i = 1; i < 6; i++) {
            if (existingContact[`Child_Birthday_${i}`]) {
                availableFields[`child${i}` as keyof typeof availableFields] = false

                if (childBirthday === existingContact[`Child_Birthday_${i}`]) {
                    // this child already is stored in zoho, so we can just upsert the contact. no need to include the child details
                    console.log('Child with matching birthday found in zoho - just upsert without child details!')
                    return this.#upsertContact(rest)
                }
            }
        }

        // if we reach this point, no match was found for this child.
        // upsert the contact with the child details, but only in a free slot.
        const freePosition = Object.values(availableFields).findIndex((it) => it === true) + 1

        if (freePosition === 0) {
            // there is no free position (since findIndex returns -1).
            // in this case, unfortunately ignore the child details, since this parent already has 5 children
            console.log("Child is new, but there is no room for them in zoho... so can't add them!")
            return this.#upsertContact(rest)
        }

        // and finally, upsert the contact with the child details into the free spot
        console.log(`Adding child into position ${freePosition}.`)
        return this.#upsertContact({
            ...rest,
            [`Child_Name_${freePosition}`]: childName,
            [`Child_Birthday_${freePosition}`]: childBirthday,
        })
    }

    async #upsertContact(
        values: WithBaseProps<{
            service: Service
            customer_type: 'B2C' | 'B2B'
            branch?: string
            Party_Type?: 'Studio' | 'Mobile' | ''
            Party_Date?: string
            Company?: string
            Child_Name_1?: string
            Child_Birthday_1?: string // !! ISO date string
            Child_Name_2?: string
            Child_Birthday_2?: string // !! ISO date string
            Child_Name_3?: string
            Child_Birthday_3?: string // !! ISO date string
            Child_Name_4?: string
            Child_Birthday_4?: string // !! ISO date string
            Child_Name_5?: string
            Child_Birthday_5?: string // !! ISO date string
        }>
    ) {
        const { firstName, lastName, email, mobile, service, customer_type, branch, ...rest } = values

        await this.#request({
            endpoint: 'Contacts/upsert',
            method: 'POST',
            data: [
                {
                    First_Name: firstName,
                    Last_Name: lastName || 'N/A',
                    Phone: mobile || '',
                    Email: email,
                    Service: [service],
                    Customer_Type: customer_type,
                    Branch: [branch || ''],
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

        return this.#upsertContact({
            service: 'Birthday Party',
            Party_Type: type === 'studio' ? 'Studio' : type === 'mobile' ? 'Mobile' : '',
            customer_type: 'B2C',
            branch: capitalise(studio),
            Party_Date: DateTime.fromJSDate(partyDate).toISODate(),
            ...baseProps,
        })
    }

    addBirthdayPartyGuestContact(props: BaseProps) {
        return this.#upsertContact({
            service: 'Birthday Party Guest',
            customer_type: 'B2C',
            ...props,
        })
    }

    addHolidayProgramContact(
        props: WithBaseProps<{
            studio: Location | 'test'
            childName: string
            childBirthdayISO: string // ISO string
        }>
    ) {
        const { studio, childName, childBirthdayISO, ...baseProps } = props
        return this.#addParentWithChild({
            service: 'Holiday Program',
            branch: capitalise(studio),
            customer_type: 'B2C',
            childName,
            childBirthdayISO,
            ...baseProps,
        })
    }

    addAfterSchoolProgramContact(props: BaseProps) {
        return this.#upsertContact({
            service: 'After School Program',
            customer_type: 'B2C',
            ...props,
        })
    }

    addBasicB2CContact(props: WithBaseProps<{ studio?: Location | undefined }>) {
        const { studio, ...baseProps } = props
        return this.#upsertContact({
            service: '',
            branch: capitalise(studio || ''),
            customer_type: 'B2C',
            ...baseProps,
        })
    }

    addBasicB2BContact(props: WithBaseProps<{ service: 'incursion' | 'activation_event'; company?: string }>) {
        const { service, company, ...baseProps } = props

        return Promise.all([
            this.#upsertContact({
                service: service === 'incursion' ? 'Incursion' : 'Activation / Event',
                customer_type: 'B2B',
                Company: company || '',
                ...baseProps,
            }),
            // TODO  - If its an actiation or an event it should be assigned to lami, not melissa
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
                    Lead_Status: 'New Lead',
                },
            ],
        })
    }
}
