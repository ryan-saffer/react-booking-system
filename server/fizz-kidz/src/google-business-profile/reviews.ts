import type { Studio } from '../core/studio'

export type GoogleBusinessProfileReview = {
    id: string
    studio?: Studio
    locationId: string
    locationName: string
    locationTitle?: string
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
