export const API_CORS_ORIGINS = [
    /^https:\/\/([a-z0-9-]+\.)?fizzkidz\.com\.au$/,
    /^https:\/\/(bookings-prod|booking-system-6435d)\.(web\.app|firebaseapp\.com)$/,
    /^https:\/\/[a-z0-9-]+\.netlify\.app$/,
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
]

export function isApiCorsOriginAllowed(origin: string) {
    return API_CORS_ORIGINS.some((allowedOrigin) => allowedOrigin.test(origin))
}
