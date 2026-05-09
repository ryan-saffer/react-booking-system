import { type Studio } from 'fizz-kidz'

import { DatabaseClient } from '@/firebase/DatabaseClient'
import { getOAuth2Client } from '@/google/google-oauth'
import { MixpanelClient } from '@/mixpanel/mixpanel-client'

import {
    getGoogleBusinessProfileLocationId,
    getGoogleBusinessProfileStudioFromLocationId,
} from './google-business-profile-studios'

export type GoogleBusinessProfileReviewNotification = {
    notificationType: 'NEW_REVIEW' | 'UPDATED_REVIEW'
    locationName: string
    reviewName: string
}

type GoogleBusinessProfileApiReview = {
    name: string
    reviewId?: string
    reviewer?: {
        profilePhotoUrl?: string
        displayName?: string
        isAnonymous?: boolean
    }
    starRating?: string
    comment?: string
    createTime?: string
    updateTime?: string
    reviewReply?: {
        comment?: string
        updateTime?: string
    }
}

export function isGoogleBusinessProfileReviewNotification(
    input: unknown
): input is GoogleBusinessProfileReviewNotification {
    if (!input || typeof input !== 'object') return false

    const notification = input as Partial<GoogleBusinessProfileReviewNotification>

    return (
        (notification.notificationType === 'NEW_REVIEW' || notification.notificationType === 'UPDATED_REVIEW') &&
        typeof notification.locationName === 'string' &&
        typeof notification.reviewName === 'string'
    )
}

export async function handleGoogleBusinessProfileReviewNotification(
    notification: GoogleBusinessProfileReviewNotification
) {
    const review = await getGoogleBusinessProfileReview(notification.reviewName)
    const locationTitle = await getGoogleBusinessProfileLocationTitle(notification.locationName)
    const locationId = getGoogleBusinessProfileLocationId(notification.locationName)
    const studio = getGoogleBusinessProfileStudioFromLocationId(locationId)
    await upsertGoogleBusinessProfileReview(review, notification.locationName, locationId, locationTitle, studio)

    const mixpanel = await MixpanelClient.getInstance()

    await mixpanel.track('google-business-profile-review', {
        distinct_id: review.reviewer?.displayName ?? review.reviewId ?? notification.reviewName,
        notificationType: notification.notificationType,
        locationName: notification.locationName,
        locationTitle,
        studio,
        reviewName: notification.reviewName,
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
    })
}

async function upsertGoogleBusinessProfileReview(
    review: GoogleBusinessProfileApiReview,
    locationName: string,
    locationId: string,
    locationTitle: string | undefined,
    studio: Studio | undefined
) {
    await DatabaseClient.upsertGoogleBusinessProfileReviews([
        {
            id: getReviewDocumentId(review.name),
            studio: studio ?? null,
            locationId,
            locationName,
            locationTitle: locationTitle ?? null,
            reviewName: review.name,
            reviewId: review.reviewId ?? null,
            reviewerDisplayName: review.reviewer?.displayName ?? null,
            reviewerIsAnonymous: review.reviewer?.isAnonymous ?? null,
            starRating: review.starRating ?? null,
            starRatingValue: mapGoogleStarRatingToNumber(review.starRating) ?? null,
            comment: review.comment ?? null,
            createTime: review.createTime ?? null,
            updateTime: review.updateTime ?? null,
            hasReply: !!review.reviewReply,
            replyUpdateTime: review.reviewReply?.updateTime ?? null,
        },
    ])
}

function getReviewDocumentId(reviewName: string) {
    return reviewName.replace(/\//g, '__')
}

async function getGoogleBusinessProfileReview(reviewName: string): Promise<GoogleBusinessProfileApiReview> {
    const response = await fetchWithGoogleAuth(`https://mybusiness.googleapis.com/v4/${reviewName}`)

    if (!response.ok) {
        throw new Error(`Unable to fetch Google Business Profile review '${reviewName}': ${response.status}`)
    }

    return (await response.json()) as GoogleBusinessProfileApiReview
}

async function getGoogleBusinessProfileLocationTitle(locationName: string) {
    const businessInformationLocationName = `locations/${locationName.split('/').at(-1)}`
    const url = new URL(`https://mybusinessbusinessinformation.googleapis.com/v1/${businessInformationLocationName}`)
    url.searchParams.set('readMask', 'title')

    try {
        const response = await fetchWithGoogleAuth(url.toString())
        const location = (await response.json()) as { title?: string }
        return location.title
    } catch {
        return undefined
    }
}

async function fetchWithGoogleAuth(url: string) {
    const oauth2Client = await getOAuth2Client()
    const { token } = await oauth2Client.getAccessToken()

    if (!token) throw new Error('Unable to fetch Google OAuth access token')

    return fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
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
