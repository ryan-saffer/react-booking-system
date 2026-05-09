import prompts from 'prompts'

import { type GoogleBusinessProfileReview, type Studio } from 'fizz-kidz'

import { DatabaseClient } from '@/firebase/DatabaseClient'
import { getOAuth2Client } from '@/google/google-oauth'

import {
    getGoogleBusinessProfileLocationId,
    getGoogleBusinessProfileStudioFromLocationId,
} from '../../google-business-profile/core/google-business-profile-studios'

type GoogleBusinessProfileLocation = {
    name: string
    title?: string
}

type GoogleBusinessProfileApiReview = {
    name: string
    reviewId?: string
    reviewer?: {
        displayName?: string
        isAnonymous?: boolean
    }
    starRating?: string
    comment?: string
    createTime?: string
    updateTime?: string
    reviewReply?: {
        updateTime?: string
    }
}

type ListLocationsResponse = {
    locations?: GoogleBusinessProfileLocation[]
    nextPageToken?: string
}

type ListReviewsResponse = {
    reviews?: GoogleBusinessProfileApiReview[]
    nextPageToken?: string
}

type MixpanelImportEvent = {
    event: 'Google Review'
    properties: {
        token: string
        time: number
        distinct_id: string
        $insert_id: string
        notificationType: 'HISTORICAL_IMPORT'
        locationName: string
        locationTitle?: string
        studio?: Studio
        reviewName: string
        reviewId?: string
        reviewerDisplayName?: string
        reviewerIsAnonymous?: boolean
        starRating?: string
        starRatingValue?: number
        comment?: string
        createTime?: string
        updateTime?: string
        hasReply: boolean
        replyUpdateTime?: string
    }
}

const MIXPANEL_RETENTION_DAYS = 1825

export async function importGoogleReviewsToMixpanel() {
    const mixpanelToken = process.env.MIXPANEL_API_KEY
    const mixpanelSecret = process.env.MIXPANEL_API_SECRET

    if (!mixpanelToken) throw new Error('MIXPANEL_API_KEY is required')
    if (!mixpanelSecret) throw new Error('MIXPANEL_API_SECRET is required')

    const { accountId, includeRatingOnlyReviews } = await prompts([
        {
            type: 'text',
            name: 'accountId',
            message: 'Google Business Profile account id',
            initial: '112832034698683075484',
        },
        {
            type: 'confirm',
            name: 'includeRatingOnlyReviews',
            message: 'Import rating-only reviews too?',
            initial: true,
        },
    ])

    if (!accountId) {
        console.log('Cancelled')
        return
    }

    const locations = await listGoogleBusinessProfileLocations(accountId)
    const events: MixpanelImportEvent[] = []
    const firestoreReviews: GoogleBusinessProfileReview[] = []

    for (const location of locations) {
        const reviews = await listGoogleBusinessProfileReviews(accountId, location.name)
        firestoreReviews.push(...reviews.map((review) => mapReviewToFirestoreReview(review, location)))

        const reviewEvents = reviews
            .filter((review) => includeRatingOnlyReviews || !!review.comment)
            .map((review) => mapReviewToMixpanelEvent(review, location, mixpanelToken))
            .filter(isWithinMixpanelRetention)

        events.push(...reviewEvents)
        console.log(
            `${location.title ?? location.name}: ${reviewEvents.length}/${reviews.length} reviews ready for Mixpanel`
        )
    }

    await DatabaseClient.upsertGoogleBusinessProfileReviews(firestoreReviews)
    console.log(`Upserted ${firestoreReviews.length} reviews to Firestore`)

    if (events.length === 0) {
        console.log('No reviews to import')
        return
    }

    console.log(`Ready to import ${events.length} Google reviews to Mixpanel`)

    const { confirmed } = await prompts({
        type: 'confirm',
        name: 'confirmed',
        message: 'Import these historical events now?',
        initial: false,
    })

    if (!confirmed) {
        console.log('Cancelled')
        return
    }

    for (let i = 0; i < events.length; i += 50) {
        const batch = events.slice(i, i + 50)
        await importMixpanelBatch(batch, mixpanelSecret)
        console.log(`Imported ${Math.min(i + batch.length, events.length)}/${events.length}`)
    }
}

async function listGoogleBusinessProfileLocations(accountId: string): Promise<GoogleBusinessProfileLocation[]> {
    const locations: GoogleBusinessProfileLocation[] = []
    let pageToken: string | undefined

    do {
        const url = new URL(`https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations`)
        url.searchParams.set('readMask', 'name,title')
        url.searchParams.set('pageSize', '100')
        if (pageToken) url.searchParams.set('pageToken', pageToken)

        const response = await fetchWithGoogleAuth(url.toString())
        const data = (await response.json()) as ListLocationsResponse

        locations.push(...(data.locations ?? []))
        pageToken = data.nextPageToken
    } while (pageToken)

    return locations
}

async function listGoogleBusinessProfileReviews(
    accountId: string,
    locationName: string
): Promise<GoogleBusinessProfileApiReview[]> {
    const reviews: GoogleBusinessProfileApiReview[] = []
    let pageToken: string | undefined
    const v4LocationName = locationName.startsWith('accounts/') ? locationName : `accounts/${accountId}/${locationName}`

    do {
        const url = new URL(`https://mybusiness.googleapis.com/v4/${v4LocationName}/reviews`)
        url.searchParams.set('pageSize', '50')
        url.searchParams.set('orderBy', 'updateTime desc')
        if (pageToken) url.searchParams.set('pageToken', pageToken)

        const response = await fetchWithGoogleAuth(url.toString())
        const data = (await response.json()) as ListReviewsResponse

        reviews.push(...(data.reviews ?? []))
        pageToken = data.nextPageToken
    } while (pageToken)

    return reviews
}

function mapReviewToMixpanelEvent(
    review: GoogleBusinessProfileApiReview,
    location: GoogleBusinessProfileLocation,
    mixpanelToken: string
): MixpanelImportEvent {
    const time = review.createTime ?? review.updateTime
    const locationId = getGoogleBusinessProfileLocationId(location.name)

    if (!time) throw new Error(`Review '${review.name}' does not have createTime or updateTime`)
    const timestamp = Math.floor(new Date(time).getTime() / 1000)

    if (Number.isNaN(timestamp)) throw new Error(`Review '${review.name}' has an invalid time '${time}'`)

    return {
        event: 'Google Review',
        properties: {
            token: mixpanelToken,
            time: timestamp,
            distinct_id: review.reviewer?.displayName ?? review.reviewId ?? review.name,
            $insert_id: `google-review_${getReviewDocumentId(review.name)}`,
            notificationType: 'HISTORICAL_IMPORT',
            locationName: location.name,
            locationTitle: location.title,
            studio: getGoogleBusinessProfileStudioFromLocationId(locationId),
            reviewName: review.name,
            reviewId: review.reviewId,
            reviewerDisplayName: review.reviewer?.displayName,
            reviewerIsAnonymous: review.reviewer?.isAnonymous,
            starRating: review.starRating,
            starRatingValue: mapGoogleStarRatingToNumber(review.starRating),
            comment: review.comment,
            createTime: review.createTime,
            updateTime: review.updateTime,
            hasReply: !!review.reviewReply,
            replyUpdateTime: review.reviewReply?.updateTime,
        },
    }
}

function mapReviewToFirestoreReview(
    review: GoogleBusinessProfileApiReview,
    location: GoogleBusinessProfileLocation
): GoogleBusinessProfileReview {
    const locationId = getGoogleBusinessProfileLocationId(location.name)

    return {
        id: getReviewDocumentId(review.name),
        studio: getGoogleBusinessProfileStudioFromLocationId(locationId),
        locationId,
        locationName: location.name,
        locationTitle: location.title,
        reviewName: review.name,
        reviewId: review.reviewId,
        reviewerDisplayName: review.reviewer?.displayName,
        reviewerIsAnonymous: review.reviewer?.isAnonymous,
        starRating: review.starRating,
        starRatingValue: mapGoogleStarRatingToNumber(review.starRating),
        comment: review.comment,
        createTime: review.createTime,
        updateTime: review.updateTime,
        hasReply: !!review.reviewReply,
        replyUpdateTime: review.reviewReply?.updateTime,
    }
}

function getReviewDocumentId(reviewName: string) {
    return reviewName.replace(/\//g, '__')
}

function isWithinMixpanelRetention(event: MixpanelImportEvent) {
    const earliestAllowedTimestamp = Math.floor(Date.now() / 1000) - MIXPANEL_RETENTION_DAYS * 24 * 60 * 60
    return event.properties.time >= earliestAllowedTimestamp
}

function mapGoogleStarRatingToNumber(starRating?: string) {
    switch (starRating) {
        case 'ONE':
            return 1
        case 'TWO':
            return 2
        case 'THREE':
            return 3
        case 'FOUR':
            return 4
        case 'FIVE':
            return 5
        default:
            return undefined
    }
}

async function fetchWithGoogleAuth(url: string) {
    const oauth2Client = await getOAuth2Client()
    const { token } = await oauth2Client.getAccessToken()

    if (!token) throw new Error('Unable to fetch Google OAuth access token')

    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })

    if (!response.ok) {
        const text = await response.text()
        throw new Error(`Google Business Profile request failed: ${response.status} ${text}`)
    }

    return response
}

async function importMixpanelBatch(events: MixpanelImportEvent[], mixpanelSecret: string) {
    const credentials = Buffer.from(`${mixpanelSecret}:`).toString('base64')
    const response = await fetch('https://api.mixpanel.com/import?strict=1', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(events),
    })

    if (!response.ok) {
        const text = await response.text()
        throw new Error(`Mixpanel import failed: ${response.status} ${text}`)
    }
}
