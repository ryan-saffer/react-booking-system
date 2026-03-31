import { DateTime } from 'luxon'

import type { Booking, PartyLostReason, Studio, StudioOrTest } from 'fizz-kidz'
import { capitalise, getApplicationDomain } from 'fizz-kidz'

import { env } from '@/init'
import {
    PartyThemeDisplayValueMap,
    ReferenceDisplayValueMap,
    type PartyTheme,
    type ReferenceOption,
} from '@/website/core/website-form-types'

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

const CHILD_MODULE_NAME = 'Child'

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
        props:
            | { endpoint: string; method: 'GET' }
            | {
                  endpoint: string
                  method: 'POST' | 'PUT'
                  data: Record<string, any>[]
                  duplicate_check_fields?: string[]
              },
        retryCount = 1
    ): Promise<any> {
        const doFetch = () =>
            fetch(`https://www.zohoapis.com.au/crm/v6/${props.endpoint}`, {
                headers: {
                    Authorization: `Zoho-oauthtoken ${this.#accessToken}`,
                },
                method: props.method,
                ...((props.method === 'POST' || props.method === 'PUT') && {
                    body: JSON.stringify({ data: props.data, duplicate_check_fields: props.duplicate_check_fields }),
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

    #toDateTimeISO(date: string) {
        return DateTime.fromISO(date, { zone: 'Australia/Melbourne' }).toISO({
            suppressMilliseconds: true,
            includeOffset: true,
        })
    }

    #toDateISO(date: string) {
        return DateTime.fromISO(date, { zone: 'Australia/Melbourne' }).toISODate()
    }

    async #upsertContact(
        values: WithBaseProps<{
            optOutOfMarketing?: boolean
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
        const { firstName, lastName, email, mobile, service, customer_type, branch, optOutOfMarketing, ...rest } =
            values

        const result = await this.#request({
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
                    ...(optOutOfMarketing !== undefined
                        ? { Marketing_Campaign_Opt_Out: optOutOfMarketing }
                        : {}),
                    ...rest,
                    $append_values: {
                        Service: true,
                        Branch: true,
                    },
                },
            ],
        })

        if (result?.data?.[0]?.code === 'SUCCESS') {
            return result.data[0].details.id as string
        } else {
            throw new Error(`Unable to upsert contact in Zoho: ${firstName} ${lastName} - ${email}`)
        }
    }

    /**
     * Creates a child in Zoho, combining the parent zoho record id and the childs DOB as a unique key.
     * This key is then used as an upsert check to determine whether to link to an existing child or create a new one.
     **/
    async #upsertChild(props: {
        childName: string
        parentContactId: string
        childBirthdayISO: string
        optOutOfMarketing: boolean
    }) {
        const childBirthday = this.#toDateISO(props.childBirthdayISO)
        const result = await this.#request({
            method: 'POST',
            endpoint: `${CHILD_MODULE_NAME}/upsert`,
            data: [
                {
                    Name: props.childName,
                    Child_Birthday: childBirthday,
                    Parent: {
                        id: props.parentContactId,
                    },
                    Marketing_Campaign_Opt_Out: props.optOutOfMarketing,
                    Unique_Child_Key: `${props.parentContactId}|${childBirthday}`,
                },
            ],
            duplicate_check_fields: ['Unique_Child_Key'],
        })
        if (result?.data?.[0]?.code === 'SUCCESS') {
            return result.data[0].details.id as string
        } else {
            throw new Error(
                `Unable to upsert child in Zoho: ${props.childName} with parent id: ${props.parentContactId}`
            )
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
            Holiday_Program_Date?: string
            optOutOfMarketing: boolean
        }>
    ) {
        const parentContactId = await this.#upsertContact(values)

        await this.#upsertChild({
            childName: values.childName,
            childBirthdayISO: values.childBirthdayISO,
            parentContactId,
            optOutOfMarketing: values.optOutOfMarketing,
        })
    }

    addBirthdayPartyContact(
        props: WithBaseProps<{ type: Booking['type']; studio: Studio; partyDate: Date; optOutOfMarketing: boolean }>
    ) {
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
            optOutOfMarketing: boolean
        }>
    ) {
        const { studio, childName, childBirthdayISO, holidayProgramDateISO, optOutOfMarketing, ...baseProps } = props

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
                optOutOfMarketing,
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
            optOutOfMarketing,
            ...(existingDate ? {} : { Holiday_Program_Date: holidayProgramDateISO }), // if they already have a date, no need to overwrite it
            ...baseProps,
        })
    }

    async addPlayLabContact(
        props: WithBaseProps<{
            studio: StudioOrTest
            childName: string
            childBirthdayISO: string // ISO string,
            optOutOfMarketing: boolean
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

    addAfterSchoolProgramContact(
        props: WithBaseProps<{ childName: string; childBirthdayISO: string; optOutOfMarketing: boolean }>
    ) {
        return this.#addParentWithChild({
            service: 'After School Program',
            customer_type: 'B2C',
            ...props,
        })
    }

    addBasicB2CContact(props: WithBaseProps<{ studio?: Studio | undefined; optOutOfMarketing: boolean }>) {
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
                optOutOfMarketing: false,
                ...baseProps,
            }),
            this.createLead({
                company: company || '',
                source: 'Website Form',
                optOutOfMarketing: false,
                ...baseProps,
            }),
        ])
    }

    createLead(props: WithBaseProps<{ company: string; source: string; optOutOfMarketing: boolean }>) {
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
                    Marketing_Campaign_Opt_Out: props.optOutOfMarketing,
                },
            ],
        })
    }

    createBirthdayPartyDeal(
        props: WithBaseProps<{
            contactId: string
            preferredDateAndTime: string
            type: Booking['type'] | 'other'
            studio: Studio | ''
            suburb?: string
            reference: ReferenceOption
            partyTheme: PartyTheme
            enquiry: string
        }>
    ) {
        return this.#request({
            endpoint: 'Deals',
            method: 'POST',
            data: [
                {
                    Deal_Name: `${props.firstName}${props.lastName ? ' ' + props.lastName : ''}`,
                    Service: 'Birthday Party',
                    Pipeline: 'Birthday Party Pipeline',
                    Contact_Name: {
                        id: props.contactId,
                    },
                    Stage: 'New Enquiry',
                    Stage_Entry_Date: DateTime.now().setZone('Australia/Melbourne').toISODate(),
                    Preferred_Date_And_Time: props.preferredDateAndTime,
                    Customer_Type: 'B2C',
                    Party_Type:
                        props.type === 'studio' ? 'Fizz Kidz Studio' : props.type === 'mobile' ? 'At-Home' : 'Other',
                    Branch: props.studio ? capitalise(props.studio) : '',
                    Suburb: props.suburb || '',
                    Owner: '76392000000333090', // Lami
                    Closing_Date: DateTime.now().plus({ weeks: 3 }).setZone('Australia/Melbourne').toISODate(),
                    Lead_Source: ReferenceDisplayValueMap[props.reference],
                    Party_Theme: PartyThemeDisplayValueMap[props.partyTheme],
                    Description: props.enquiry,
                },
            ],
        })
    }

    async confirmBirthdayPartyDealAndLinkChild({
        dealId,
        parentContactId,
        parentName,
        type,
        studio,
        address,
        children,
        partyDateISO,
        bookingId,
    }: {
        dealId?: string
        parentContactId: string
        parentName: string
        type: Booking['type'] | 'other'
        studio: Studio
        address: string
        children: Booking['children']
        partyDateISO: string
        bookingId: string
    }) {
        const childIds = await Promise.all(
            children!.map((child) =>
                this.#upsertChild({
                    parentContactId,
                    childName: child.name,
                    childBirthdayISO: child.birthday,
                    optOutOfMarketing: false,
                })
            )
        )

        const result = await this.#request({
            endpoint: 'Deals/upsert',
            method: 'POST',
            data: [
                {
                    id: dealId || undefined,
                    Stage: 'Confirmed Booking',
                    Stage_Entry_Date: DateTime.now().setZone('Australia/Melbourne').toISODate(),
                    Deal_Name: parentName,
                    Service: 'Birthday Party',
                    Pipeline: 'Birthday Party Pipeline',
                    Contact_Name: {
                        id: parentContactId,
                    },
                    Party_Type: type === 'studio' ? 'Fizz Kidz Studio' : type === 'mobile' ? 'At-Home' : 'Other',
                    Branch: capitalise(studio),
                    Address: address,
                    Children: childIds.map((childId) => ({
                        Children: { id: childId },
                    })),
                    Actual_Party_Date: this.#toDateTimeISO(partyDateISO),
                    Booking_ID: bookingId,
                    Booking_URL: `${getApplicationDomain(env)}/dashboard/bookings?id=${bookingId}`,
                },
            ],
            duplicate_check_fields: ['Booking_ID'],
        })

        if (result?.data?.[0]?.code === 'SUCCESS') {
            return result.data[0].details.id as string
        } else {
            throw new Error(`${result.data[0].code} - ${result.data[0].message}`)
        }
    }

    updatePartyDetailEventDate(zohoDealId: string, partyDateISO: string) {
        return this.#request({
            endpoint: 'Deals',
            method: 'PUT',
            data: [
                {
                    id: zohoDealId,
                    Actual_Party_Date: this.#toDateTimeISO(partyDateISO),
                },
            ],
        })
    }

    markPartyDealClosedLost(zohoDealId: string, lostReason: PartyLostReason, lostReasonOther: string | undefined) {
        return this.#request({
            endpoint: 'Deals',
            method: 'PUT',
            data: [
                {
                    id: zohoDealId,
                    Stage: 'Lost Booking',
                    Stage_Entry_Date: DateTime.now().setZone('Australia/Melbourne').toISODate(),
                    Reason_For_Loss__s: lostReason,
                    Other_Reason: lostReasonOther,
                },
            ],
        })
    }
}
