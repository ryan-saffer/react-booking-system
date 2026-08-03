import { getStore } from '@netlify/blobs'

const SITE_ID = '44edea96-5fbf-4c21-b5b0-8e29832d5237'

function getInstagramErrorMessage(response: any, fallback: string) {
    return response?.error?.message ?? fallback
}

class InstagramClient {
    async getAccessToken() {
        // get current token
        const apiKeys = getStore({
            name: 'apiKeys',
            siteID: SITE_ID,
            token: import.meta.env.NETLIFY_TOKEN,
        })
        const instagram = await apiKeys.getWithMetadata('instagram')

        if (!instagram) throw new Error('No instagram token blob found')

        let accessToken = instagram.data
        const expireTime = instagram.metadata.expires as number

        // if the token is going to expire within 7 days, refresh it
        const millisecondsUntilExpiry = expireTime - Date.now()
        const sevenDaysInMilliseconds = 1000 * 60 * 60 * 24 * 7
        if (millisecondsUntilExpiry < sevenDaysInMilliseconds) {
            console.log('refreshing instagram access token')
            const result = await fetch(
                `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`
            )

            const response = await result.json().catch(() => undefined)
            if (!result.ok) {
                throw new Error(
                    `Failed to refresh Instagram access token (${result.status}): ${getInstagramErrorMessage(response, result.statusText)}`
                )
            }

            // store it back into the blob
            accessToken = response.access_token
            await apiKeys.set('instagram', accessToken, {
                metadata: {
                    expires: Math.round(Date.now()) + response.expires_in * 1000, // instagram returns expiry in seconds
                },
            })
        }

        return accessToken
    }

    async getRecentPosts() {
        try {
            const accessToken = await this.getAccessToken()
            const result = await fetch(
                `https://graph.instagram.com/me/media?fields=media_url,caption,media_type,thumbnail_url,permalink&access_token=${accessToken}`,
                {
                    method: 'GET',
                }
            )

            const posts = await result.json().catch(() => undefined)
            if (!result.ok) {
                console.error(
                    `Failed to fetch Instagram posts (${result.status}): ${getInstagramErrorMessage(posts, result.statusText)}`
                )
                return []
            }

            if (!Array.isArray(posts?.data)) {
                console.error('Failed to fetch Instagram posts: response data missing')
                return []
            }

            return posts.data.filter(
                (it: any) =>
                    // its possible instagram doesnt return media_url if content is marked as copyright violated.
                    // so just filter out bad data here to be safe.
                    (it.media_type === 'VIDEO' && !!it.thumbnail_url) ||
                    (it.media_type === 'IMAGE' && !!it.media_url) ||
                    (it.media_type === 'CAROUSEL_ALBUM' && !!it.media_url)
            ) as ({
                media_url: string
                permalink: string
                caption: string
            } & (
                | {
                      media_type: 'VIDEO'
                      thumbnail_url: string
                  }
                | { media_type: 'IMAGE' | 'CAROUSEL_ALBUM' }
            ))[]
        } catch (error) {
            console.error(error instanceof Error ? error.message : error)
            return []
        }
    }
}

const instagramClient = new InstagramClient()
export { instagramClient }
