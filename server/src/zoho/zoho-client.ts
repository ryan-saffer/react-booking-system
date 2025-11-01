import type { Booking, Studio, StudioOrTest } from 'fizz-kidz'
import { capitalise } from 'fizz-kidz'
import { DateTime } from 'luxon'

import { DatabaseClient } from '../firebase/DatabaseClient'

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
    | 'Play Lab'
    | ''

export class ZohoClient {
    // Current valid access token
    #accessToken: string | null = null

    /**
     * Get the access token from firestore. If its currently being refreshed, wait for that to finish.
     *
     * This mechanism is in place due to many concurrent requests leading to race conditions.
     * Particularly an issue during holiday program sign in where the acuity webhook fires many events all at once.
     */
    async #getAccessToken() {
        let waitingForRefresh = true
        while (waitingForRefresh) {
            const { accessToken, isRefreshing } = await DatabaseClient.getZohoAccessToken()
            waitingForRefresh = isRefreshing
            this.#accessToken = accessToken
            if (isRefreshing) {
                await new Promise((resolve) => {
                    setTimeout(resolve, 200)
                })
            }
        }
    }

    /**
     * Refresh the access token, and store in firestore that a refresh is in progress.
     */
    async #refreshAccessToken() {
        await DatabaseClient.startRefreshingZohoAccessToken()
        const result = await fetch(
            `https://accounts.zoho.com.au/oauth/v2/token?refresh_token=${process.env.ZOHO_REFRESH_TOKEN}&client_id=${process.env.ZOHO_CLIENT_ID}&client_secret=${process.env.ZOHO_CLIENT_SECRET}&grant_type=refresh_token`,
            { method: 'POST' }
        )
        if (result.ok) {
            const body = await result.json()
            await DatabaseClient.setZohoAccessToken(body.access_token)
            this.#accessToken = body.access_token
        } else {
            await DatabaseClient.setZohoAccessToken('error')
            throw new Error('Error refreshing zoho access token')
        }
    }

    /**
     * Generic request method that will:
     * 1) Try with the current token.
     * 2) If 401, refresh token (synchronously if needed) and retry once.
     */
    async #request(
        props: { endpoint: string; method: 'GET' } | { endpoint: string; method: 'POST'; data: Record<string, any>[] },
        retryCount = 1
    ): Promise<any> {
        const doFetch = () =>
            fetch(`https://www.zohoapis.com.au/crm/v6/${props.endpoint}`, {
                headers: {
                    Authorization: `Zoho-oauthtoken ${this.#accessToken}`,
                },
                method: props.method,
                ...(props.method === 'POST' && {
                    body: JSON.stringify({ data: props.data }),
                }),
            })

        if (!this.#accessToken) {
            await this.#getAccessToken()
        }

        const result = await doFetch()

        if (result.ok) {
            if (result.status === 204) {
                // no content
                return null
            }
            return result.json()
        }

        if (result.status === 401 && retryCount === 1) {
            // refresh token (waiting if another request is already refreshing it)
            await this.#refreshAccessToken()
            return this.#request(props, retryCount - 1)
        }

        // Otherwise, throw the error body
        const errorBody = await result.json().catch(() => ({}))
        throw errorBody
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
            Holiday_Program_Date?: string
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
            Recently_Booked_Party?: boolean
            Holiday_Program_Date?: string // !! ISO date string
            Holiday_Program_Checked_In?: boolean
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

    addBirthdayPartyContact(props: WithBaseProps<{ type: Booking['type']; studio: Studio; partyDate: Date }>) {
        const { type, studio, partyDate, ...baseProps } = props

        return this.#upsertContact({
            service: 'Birthday Party',
            Party_Type: type === 'studio' ? 'Studio' : type === 'mobile' ? 'Mobile' : '',
            customer_type: 'B2C',
            branch: capitalise(studio),
            Party_Date: DateTime.fromJSDate(partyDate).toISODate(),
            // resets after 180 days in zoho campaigns automation
            Recently_Booked_Party: true,
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

    async addHolidayProgramContact(
        props: WithBaseProps<{
            studio: StudioOrTest
            childName: string
            childBirthdayISO: string // ISO string,
            holidayProgramDateISO: string // ISO string
        }>
    ) {
        const { studio, childName, childBirthdayISO, holidayProgramDateISO, ...baseProps } = props

        // need to check if this parent already has a holiday program date.
        // if not, add the date in, otherwise don't include it.
        const searchResult = await this.#request({
            endpoint: `Contacts/search?email=${encodeURIComponent(baseProps.email)})`,
            method: 'GET',
        })

        if (!searchResult) {
            // customer does not exist in zoho, so add them as new with the child
            return this.#addParentWithChild({
                service: 'Holiday Program',
                branch: capitalise(studio),
                customer_type: 'B2C',
                childName,
                childBirthdayISO,
                Holiday_Program_Date: holidayProgramDateISO,
                ...baseProps,
            })
        }

        const existingContact = searchResult.data[0]
        const existingDate = existingContact['Holiday_Program_Date']

        return this.#addParentWithChild({
            service: 'Holiday Program',
            branch: capitalise(studio),
            customer_type: 'B2C',
            childName,
            childBirthdayISO,
            ...(existingDate ? {} : { Holiday_Program_Date: holidayProgramDateISO }), // if they already have a date, no need to overwrite it
            ...baseProps,
        })
    }

    async addPlayLabContact(
        props: WithBaseProps<{
            studio: StudioOrTest
            childName: string
            childBirthdayISO: string // ISO string,
        }>
    ) {
        const { studio, childName, childBirthdayISO, ...baseProps } = props

        return this.#addParentWithChild({
            service: 'Play Lab',
            branch: capitalise(studio),
            customer_type: 'B2C',
            childName,
            childBirthdayISO,
            ...baseProps,
        })
    }

    /**
     * Check if the provided program date matches the holiday program date in zoho.
     * If so, mark the customer as checked in.
     */
    async holidayProgramCheckin({ email, programDate }: { email: string; programDate: string }) {
        const searchResult = await this.#request({
            endpoint: `Contacts/search?email=${encodeURIComponent(email)})`,
            method: 'GET',
        })

        if (!searchResult) {
            // weird that they have a holiday program booking but not found in Zoho...
            return
        }

        const existingContact = searchResult.data[0]
        const existingDate = existingContact['Holiday_Program_Date']

        if (existingDate === programDate) {
            await this.#upsertContact({
                firstName: existingContact.First_Name,
                service: 'Holiday Program',
                email: email,
                customer_type: 'B2C',
                Holiday_Program_Checked_In: true,
            })
        }
    }

    addAfterSchoolProgramContact(props: WithBaseProps<{ childName: string; childBirthdayISO: string }>) {
        return this.#addParentWithChild({
            service: 'After School Program',
            customer_type: 'B2C',
            ...props,
        })
    }

    addBasicB2CContact(props: WithBaseProps<{ studio?: Studio | undefined }>) {
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
                    Owner: '76392000000333090', // Lami
                    Lead_Source: props.source,
                    Lead_Status: 'New Lead',
                },
            ],
        })
    }
}
