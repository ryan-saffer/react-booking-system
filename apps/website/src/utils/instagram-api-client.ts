class InstagramClient {
  async getRecentPosts() {
    const accessToken = import.meta.env.INSTAGRAM_TOKEN;
    const result = await fetch(
      `https://graph.instagram.com/v20.0/17841403227407427/media?fields=media_url,caption,media_type,thumbnail_url,permalink&access_token=${accessToken}`,
      {
        method: "GET",
      },
    );

    const posts = await result.json();
    return posts.data as ({
      media_url: string;
      permalink: string;
    } & (
      | {
          media_type: "VIDEO";
          thumbnail_url: string;
        }
      | { media_type: "IMAGE" | "CAROUSEL_ALBUM" }
    ))[];
  }
}

const instagramClient = new InstagramClient();
export { instagramClient };
