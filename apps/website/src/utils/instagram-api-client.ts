import { getStore } from "@netlify/blobs";

const SITE_ID = "44edea96-5fbf-4c21-b5b0-8e29832d5237";

class InstagramClient {
  async getAccessToken() {
    // get current token
    const apiKeys = getStore({
      name: "apiKeys",
      siteID: SITE_ID,
      token: import.meta.env.NETLIFY_TOKEN,
    });
    const instagram = await apiKeys.getWithMetadata("instagram");

    if (!instagram) throw new Error("No instagram token blob found");

    let accessToken = instagram.data;
    const expireTime = instagram.metadata.expires as number;

    // if the token is going to expire within 7 days, refresh it
    const millisecondsUntilExpiry = expireTime - Date.now();
    const sevenDaysInMilliseconds = 1000 * 60 * 60 * 24 * 7;
    if (millisecondsUntilExpiry < sevenDaysInMilliseconds) {
      console.log("refreshing instagram access token");
      const result = await fetch(
        `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`,
      );
      if (result.ok) {
        // store it back into the blob
        const response = await result.json();
        accessToken = response.access_token;
        await apiKeys.set("instagram", accessToken, {
          metadata: {
            expires: Math.round(Date.now()) + response.expires_in * 1000, // instagram returns expiry in seconds
          },
        });
      }
    }

    return accessToken;
  }

  async getRecentPosts() {
    const accessToken = await this.getAccessToken();
    const result = await fetch(
      `https://graph.instagram.com/v20.0/17841403227407427/media?fields=media_url,caption,media_type,thumbnail_url,permalink&access_token=${accessToken}`,
      {
        method: "GET",
      },
    );

    if (result.status === 200) {
      const posts = await result.json();
      return posts.data as ({
        media_url: string;
        permalink: string;
        caption: string;
      } & (
        | {
            media_type: "VIDEO";
            thumbnail_url: string;
          }
        | { media_type: "IMAGE" | "CAROUSEL_ALBUM" }
      ))[];
    } else {
      return [];
    }
  }
}

const instagramClient = new InstagramClient();
export { instagramClient };
