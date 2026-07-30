export async function getOAuth2Client() {
    const { google } = await import('googleapis')

    const envClientId = process.env.GOOGLE_OAUTH_CLIENT_ID
    const envClientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
    const envRefreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN
    const envRedirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI

    const OAuth2Client = new google.auth.OAuth2(envClientId, envClientSecret, envRedirectUri)
    OAuth2Client.setCredentials({ refresh_token: envRefreshToken })
    return OAuth2Client
}
