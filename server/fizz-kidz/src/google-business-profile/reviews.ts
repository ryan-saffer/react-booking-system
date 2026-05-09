import type { Studio } from '../core/studio'

export type GoogleBusinessProfileReview = {
    id: string
    studio: Studio | null
    locationId: string
    locationName: string
    locationTitle: string | null
    reviewName: string
    reviewId: string | null
    reviewerDisplayName: string | null
    reviewerIsAnonymous: boolean | null
    starRating: string | null
    starRatingValue: number | null
    comment: string | null
    createTime: string | null
    updateTime: string | null
    hasReply: boolean
    replyUpdateTime: string | null
}
